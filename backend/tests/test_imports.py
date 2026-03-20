try:
    print("Trying onnxruntime...")
    import onnxruntime as ort
    print("Success: onnxruntime")
except Exception as e:
    print(f"Failed: onnxruntime: {e}")

try:
    print("Trying torch...")
    import torch
    print("Success: torch")
except Exception as e:
    print(f"Failed: torch: {e}")

try:
    print("Trying cv2...")
    import cv2
    print("Success: cv2")
except Exception as e:
    print(f"Failed: cv2: {e}")

try:
    print("Trying Pillow (PIL)...")
    from PIL import Image
    print("Success: PIL")
except Exception as e:
    print(f"Failed: PIL: {e}")
