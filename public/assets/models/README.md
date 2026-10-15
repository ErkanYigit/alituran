# Ürün modelleri

`nass-berjer.glb`, site sahibinin sağladığı FBX dosyasından Blender ile dönüştürülmüştür. 47.770 üçgen, tek yüzey, gömülü 2048 px PBR dokular; 7,4 MiB. Yeniden dönüşüm için ana README ve `scripts/convert-nass-fbx.py` dosyasına bakın.

GLB/GLTF dosyalarını bu klasöre ekleyip `src/data/products.json` içindeki `model3d` yolunu ayarlayın. Tek yüzeyli modellerde `model3dParts: false` kullanın. `model3d: null` ürünleri ve yükleme hataları fotoğraftan uyarlanan prosedürel modele döner.
