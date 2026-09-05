import sys
import os
import json
import wave
import numpy as np

def load_audio(file_path):
    """
    Loads an audio file and converts it to 16kHz 16-bit mono PCM bytes.
    Supports standard WAV files, multi-channel WAVs, different sample rates,
    and raw PCM files.
    """
    try:
        from scipy.io import wavfile
        import scipy.signal
        sr, data = wavfile.read(file_path)
        
        # Convert multi-channel (stereo) to mono
        if hasattr(data, 'ndim') and data.ndim > 1:
            data = data.mean(axis=1)
            
        # Normalize dtype to int16
        if data.dtype == np.float32 or data.dtype == np.float64:
            data = np.clip(data, -1.0, 1.0)
            data = (data * 32767).astype(np.int16)
        elif data.dtype != np.int16:
            data = data.astype(np.int16)
            
        # Resample to 16000 Hz if necessary
        if sr != 16000 and len(data) > 0:
            target_length = int(len(data) * 16000 / sr)
            if target_length > 0:
                data = scipy.signal.resample(data, target_length).astype(np.int16)
                
        return data.tobytes()
    except Exception as e:
        # Fallback to standard library wave module or raw binary
        try:
            with wave.open(file_path, 'rb') as wf:
                channels = wf.getnchannels()
                rate = wf.getframerate()
                frames = wf.readframes(wf.getnframes())
                return frames
        except Exception:
            with open(file_path, 'rb') as f:
                return f.read()

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing audio file argument", "transcript": ""}))
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}", "transcript": ""}))
        sys.exit(1)

    # Locate Vosk Model
    model_paths = [
        os.path.abspath("models/vosk-model-small-en-us-0.15"),
        os.path.join(os.path.dirname(__file__), "../../models/vosk-model-small-en-us-0.15"),
        os.path.expanduser("~/.cache/vosk/vosk-model-small-en-us-0.15")
    ]
    
    model_path = None
    for p in model_paths:
        if os.path.exists(p):
            model_path = p
            break

    try:
        from vosk import Model, KaldiRecognizer, SetLogLevel
        SetLogLevel(-1) # Suppress Kaldi verbose logs to keep stdout clean JSON

        if model_path:
            model = Model(model_path)
        else:
            model = Model(lang="en-us")

        pcm_data = load_audio(file_path)
        if not pcm_data or len(pcm_data) < 200:
            print(json.dumps({
                "transcript": "",
                "error": "Audio file is silent or empty"
            }))
            return

        rec = KaldiRecognizer(model, 16000)
        rec.SetWords(True)

        # Feed in chunks of 4000 bytes
        chunk_size = 4000
        for i in range(0, len(pcm_data), chunk_size):
            chunk = pcm_data[i:i+chunk_size]
            rec.AcceptWaveform(chunk)

        final_res = json.loads(rec.FinalResult())
        transcript = final_res.get("text", "").strip()

        print(json.dumps({
            "success": True,
            "transcript": transcript,
            "bytes_processed": len(pcm_data)
        }))
    except Exception as ex:
        print(json.dumps({
            "success": False,
            "error": str(ex),
            "transcript": ""
        }))

if __name__ == "__main__":
    main()
