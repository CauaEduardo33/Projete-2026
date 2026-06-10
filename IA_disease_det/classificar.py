from fastapi.routing import request_response
from fastapi import FastAPI
import requests
import json
from ultralytics import YOLO
from fastapi import UploadFile



app = FastAPI()

app.post("/classificar/")
async def classificar(imagem: UploadFile):
    imagem_bytes = imagem.read()
    model = YOLO("best.onnx")
    results = model(imagem_bytes)

    for result in results:
        names = [result.names[cls.item()] for cls in result.boxes.cls.int()] 


    return {
        "resultado": names   
    } 

    

 
      



    


