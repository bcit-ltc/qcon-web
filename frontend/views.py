from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import FileResponse, JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.parsers import FileUploadParser

from django.core.files.base import ContentFile

from django.conf import settings

import requests

import logging
logger = logging.getLogger(__name__)

# Create your views here.

# from .serializers import UploadSerializer

@ensure_csrf_cookie
def index(request):
    if request.session.test_cookie_worked():
        # print(str(request.headers['Cookie']))
        pass
    request.session.set_test_cookie()

    context = {
        'version': settings.GIT_TAG,
    }
    logger.info(f"clientIp: {request.get_host()}")

    return render(request, 'index.html', context)

class GetPackage(APIView):
    parser_classes = [JSONParser]
    def post(self, request, format=None):

        api_url = "https://" + settings.API_HOST + "/package"
        if settings.DEBUG == True:
            api_url = "http://" + settings.API_HOST + ":" + settings.API_PORT + "/package"

        # print("API PACKAGE URL: " + api_url)

        headers = {'Authorization': 'Bearer ' + settings.API_KEY}

        r = requests.post(api_url, json=request.data, headers=headers)

        if str(r.status_code) == '200':
            file_name = (r.headers['Content-Disposition'].split('filename=')[1]).strip('"')
            ext = r.headers['Content-Type'].split('/')[1]
            filename = file_name + "." + ext
            responsefile = ContentFile(r.content, name=filename)

            file_response = FileResponse(responsefile)
            file_response['Content-Type'] = 'application/zip'
            file_response['Content-Disposition'] = 'attachment; filename="' + filename + '"'
            logger.info(f"Getting package: {filename}")
            return file_response
        else:
            if settings.DEBUG == True:
                return Response("qcon api error", status=r.status_code)
            else:
                logger.error(r.json())
                return Response(r.json(), status=r.status_code)
