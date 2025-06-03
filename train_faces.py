import cv2
import os
import face_recognition
import pickle

known_faces = []
known_names = []

dataset_path = 'dataset/'  # вътре: по една папка за всеки човек с негови снимки

for name in os.listdir(dataset_path):
    person_path = os.path.join(dataset_path, name)
    if not os.path.isdir(person_path):
        continue
    for filename in os.listdir(person_path):
        img_path = os.path.join(person_path, filename)
        image = face_recognition.load_image_file(img_path)
        encodings = face_recognition.face_encodings(image)
        if encodings:
            known_faces.append(encodings[0])
            known_names.append(name)

with open("face_encodings.pickle", "wb") as f:
    pickle.dump((known_faces, known_names), f)

print("Done training!")
