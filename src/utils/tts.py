
import sys
import os
from gtts import gTTS
import uuid

def generate_speech(text, output_dir):
    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Generate unique filename
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(output_dir, filename)

        # Create audio file using gTTS
        # lang='ta' for Tamil
        tts = gTTS(text=text, lang='ta', slow=False)
        tts.save(filepath)

        # Print the filename to stdout so Node.js can read it
        print(filename)
        sys.stdout.flush()

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python tts.py <text> <output_dir>", file=sys.stderr)
        sys.exit(1)

    input_text = sys.argv[1]
    output_directory = sys.argv[2]
    
    generate_speech(input_text, output_directory)
