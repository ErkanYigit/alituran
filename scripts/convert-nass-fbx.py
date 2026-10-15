"""Run with Blender: blender -b --python scripts/convert-nass-fbx.py -- INPUT_DIR OUTPUT.glb.

INPUT_DIR contains the owner's extracted FBX and adjacent .fbm textures.
The web asset embeds 2048px PBR maps; original source files remain untouched.
"""
import sys
from pathlib import Path

import bpy

source, output = [Path(value).resolve() for value in sys.argv[sys.argv.index("--") + 1:]]
files = list(source.glob("*.fbx"))
if len(files) != 1:
    raise ValueError("Expected exactly one FBX file")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(files[0]))
meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
if len(meshes) != 1:
    raise ValueError("This conversion expects the supplied single-surface Nass model")
meshes[0].name = "Nass_Berjer_Surface"
for image in bpy.data.images:
    if image.source == "FILE":
        if not Path(bpy.path.abspath(image.filepath)).is_file():
            raise FileNotFoundError(image.filepath)
        width, height = image.size
        factor = min(1, 2048 / max(width, height))
        if factor < 1:
            image.scale(round(width * factor), round(height * factor))
        image.pack()
output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=str(output),
    export_format="GLB",
    export_yup=True,
    export_materials="EXPORT",
    export_image_format="AUTO",
    export_jpeg_quality=90,
    export_animations=False,
    export_cameras=False,
    export_lights=False,
)
print(f"Exported {output} ({output.stat().st_size} bytes)")
