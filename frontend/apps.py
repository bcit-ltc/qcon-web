from django.apps import AppConfig
import os
import sys

import logging
logger = logging.getLogger(__name__)

class FrontendConfig(AppConfig):
    name = 'frontend'

    def ready(self):

        if 'runserver' in sys.argv or 'qconweb.asgi:application' in sys.argv:
            logger.info("API_HOST: " + os.environ.get('API_HOST'))
            logger.info("API_PORT: " + os.environ.get('API_PORT'))
            logger.info("APP_VERSION: " + os.environ.get('APP_VERSION'))
            logger.info("IMAGE_TAG: " + os.environ.get('IMAGE_TAG'))
            logger.info("IMAGE_TITLE: " + os.environ.get('IMAGE_TITLE'))
            logger.info("qconweb has started")
            
            if 'runserver' in sys.argv:
                logger.warning("qconweb has started in DEV mode")
            else:
                logger.info("qconweb has started in PRODUCTION mode")