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

    async def client(self):

        async with websockets.connect(self.wssurl) as websocket:
            logger.info("Connected to api")

            await websocket.send(self.file_received)

            try:
                async for message in websocket:
                    # Process message received on the connection.
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
                                print(f" User closed the session: {e}")
                                # break
                        case "Done":
                            logger.info("status: Done")
                            await self.send(text_data=json.dumps(self.message_from_api))
                        case "Close":
                            logger.info("status: Close")
                            logger.info("... closing connection to api")
                            break
                        case "Error":
                            logger.info("status: Error")
                            logger.info("... closing connection to api because of an error")
                            await self.send(text_data=json.dumps(self.message_from_api))
                            break
                    
            except websockets.ConnectionClosed:
                logger.info("connection closed")
                close_message = self.message_from_api
                close_message['status'] = "Error"
                close_message['statustext'] = "Connection to api lost!"
                await self.send(text_data=json.dumps(close_message))
                logger.info("Connection to api lost!")
            except Exception as e:
                logger.info(f'Other Exception: {e}')

    async def connect(self):
        self.sessionid = self.scope['session'].get('_csrftoken')
        # logger.info(self.scope['session'])

        await self.accept()
        logger.info("user connected: " + str(self.sessionid))

    # async def websocket_disconnect(self, message):
    #     print(" webssocket disconnect ")
    #     print(message)

    async def disconnect(self, close_code):
        self.close()
        logger.info("user disconnected: " + str(self.sessionid))

    async def receive(self, text_data=None, bytes_data=None):
        self.userip = self.scope['client'][0]
        logger.info(f"user ip: {self.userip}")
        file_recieved = json.loads(text_data)
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