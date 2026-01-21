import json
# from channels.generic.websocket import AsyncWebsocketConsumer
from channels.generic.websocket import AsyncJsonWebsocketConsumer

import websockets
from django.conf import settings
import logging
logger = logging.getLogger(__name__)

class TextConsumer(AsyncJsonWebsocketConsumer):

    file_received = None
    sessionid = None
    wssurl = None
    userip = None
    processing_complete = False  # Track if processing is complete

    async def client(self):
        # Configure websockets with increased timeouts for large messages
        # max_size=None removes message size limit (be careful in production)
        # ping_interval=30 keeps connection alive
        # close_timeout=60 allows time for large messages to be sent
        connect_kwargs = {
            'max_size': None,  # Remove message size limit
            'ping_interval': 30,  # Send ping every 30 seconds
            'close_timeout': 60,  # Wait up to 60 seconds when closing
            'read_limit': 2**30,  # 1GB read limit
            'write_limit': 2**30,  # 1GB write limit
        }

        async with websockets.connect(self.wssurl, **connect_kwargs) as websocket:
            logger.info("Connected to api")

            await websocket.send(self.file_received)

            try:
                async for message in websocket:
                    # Process message received on the connection.
                    try:
                        message = json.loads(message)
                        # print(message)
                        self.message_from_api = message

                        match message['status']:
                            case "Busy":
                                logger.info(f"status: {message['status']} message: {message['statustext']}")
                                try:
                                    await self.send(text_data=json.dumps(self.message_from_api))
                                except Exception as e:
                                    # await websocket.close()
                                    logger.error(f"User closed the session: {e}")
                                    # break
                            case "Done":
                                logger.info("status: Done")
                                # Log message size for debugging
                                message_str = json.dumps(self.message_from_api)
                                message_size = len(message_str.encode('utf-8'))
                                if message_size > 1024 * 1024:  # Log if > 1MB
                                    logger.info(f"Sending large Done message: {message_size / 1024 / 1024:.2f}MB")
                                
                                try:
                                    await self.send(text_data=message_str)
                                    logger.info("Done message sent successfully to client")
                                except Exception as e:
                                    logger.error(f"Error sending Done message to client: {e}")
                                    # Try to send error to client
                                    error_message = {
                                        'status': 'Error',
                                        'statustext': f'Failed to send response: {str(e)}',
                                        'hostname': message.get('hostname', ''),
                                        'version': message.get('version', '')
                                    }
                                    await self.send(text_data=json.dumps(error_message))
                            case "Close":
                                logger.info("status: Close")
                                logger.info("... closing connection to api")
                                # Forward Close message to browser
                                try:
                                    await self.send(text_data=json.dumps(self.message_from_api))
                                except Exception as e:
                                    logger.error(f"Error sending Close message to client: {e}")
                                # Mark processing as complete
                                self.processing_complete = True
                                break
                            case "Error":
                                logger.info("status: Error")
                                logger.info("... closing connection to api because of an error")
                                await self.send(text_data=json.dumps(self.message_from_api))
                                break
                    except json.JSONDecodeError as e:
                        logger.error(f"Error decoding JSON message from API: {e}")
                        logger.error(f"Message length: {len(message) if isinstance(message, str) else 'N/A'}")
                    except Exception as e:
                        logger.error(f"Error processing message from API: {e}")
                    
            except websockets.ConnectionClosed as e:
                logger.info(f"connection closed: {e}")
                if hasattr(self, 'message_from_api') and self.message_from_api:
                    close_message = self.message_from_api.copy()
                    close_message['status'] = "Error"
                    close_message['statustext'] = "Connection to api lost!"
                else:
                    close_message = {
                        'status': "Error",
                        'statustext': "Connection to api lost!",
                        'hostname': '',
                        'version': ''
                    }
                try:
                    await self.send(text_data=json.dumps(close_message))
                except:
                    pass
                logger.info("Connection to api lost!")
            except Exception as e:
                logger.error(f'Other Exception: {e}')
                import traceback
                logger.error(traceback.format_exc())

    async def connect(self):
        self.sessionid = self.scope['session'].get('_csrftoken')
        # logger.info(self.scope['session'])
        self.processing_complete = False  # Reset on new connection

        await self.accept()
        logger.info("user connected: " + str(self.sessionid))

    # async def websocket_disconnect(self, message):
    #     print(" webssocket disconnect ")
    #     print(message)

    async def disconnect(self, close_code):
        self.close()
        logger.info("user disconnected: " + str(self.sessionid))

    async def receive(self, text_data=None, bytes_data=None):
        # If processing is already complete, ignore new messages (like keepalive pings)
        if self.processing_complete:
            logger.info("Ignoring message - processing already complete")
            return
        
        self.userip = self.scope['client'][0]
        logger.info(f"user ip: {self.userip}")
        
        try:
            file_recieved = json.loads(text_data)
            # Check if this is a keepalive ping from the browser
            if file_recieved.get('type') == 'ping':
                logger.debug("Received keepalive ping from browser")
                # Send pong response
                await self.send(text_data=json.dumps({'type': 'pong'}))
                return
            
            # Add IP to the user request
            file_recieved["user_ip"] = str(self.userip)
            # Convert back to json string
            self.file_received = json.dumps(file_recieved)

            self.wssurl = "wss://" + settings.API_HOST + '/ws'
            if settings.DEBUG == True:
                self.wssurl = "ws://" + settings.API_HOST + ":" + settings.API_PORT + '/ws'

            logger.info("WSS URL: " + self.wssurl)

            try:
                await self.client()
            except Exception as e:
                logger.info("Error connecting: " + str(e))
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing message from browser: {e}")
            # Try to send error to browser
            try:
                await self.send(text_data=json.dumps({
                    'status': 'Error',
                    'statustext': 'Invalid message format'
                }))
            except:
                pass



        # error_code = 4011
        # try:
        #     # super().receive() will call our receive_json()
        #     await super().receive(text_data=text_data, bytes_data=bytes_data)
        #     # msg1 = json.loads(text_data)
        #     # print(msg1['filename'])
        #     self.file_received = text_data
        #     self.wssurl = "wss://" + settings.API_HOST + '/ws/' + str(self.sessionid) + '/'
        #     if settings.DEBUG == True:
        #         self.wssurl = "ws://" + settings.API_HOST + ":" + settings.API_PORT + '/ws/' + str(self.sessionid) + '/'

        #     print("WSS URL: " + self.wssurl)

        #     try:
        #         await self.client()
        #     except Exception as e:
        #         print("Error connecting: " + str(e))
        #         raise
        # except Exception:
        #     print("disconnect exception ocuurr")
        #     await self.disconnect({'code': error_code})
        #     # # Or, if you need websocket_disconnect (eg. for autogroups), try this:
        #     #
        #     # try:
        #     #     await self.websocket_disconnect({'code': error_code})
        #     # except StopConsumer:
        #     #     pass

        #     # Try and close cleanly
        #     await self.close(error_code)

        #     raise