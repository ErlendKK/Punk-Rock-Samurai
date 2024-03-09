from pydub import AudioSegment

def cut_audio(file_path, start_time, end_time, output_path):
    """
    Cuts a part from an MP3 file and saves it to a new file.

    """
    # Load the audio file
    audio = AudioSegment.from_mp3(file_path)

    # Convert HH:MM:SS to milliseconds
    start_time_ms = sum(int(x) * 60 ** i * 1000 for i, x in enumerate(reversed(start_time.split(":"))))
    end_time_ms = sum(int(x) * 60 ** i * 1000 for i, x in enumerate(reversed(end_time.split(":"))))
    
    # Extract the desired part and save the extracted part to a new file
    extracted_audio = audio[start_time_ms:end_time_ms]
    extracted_audio.export(output_path, format="mp3")

file_path = r"C:\Spill\Punk Rock Samurai\assets\sounds\punk-rock-instrumental.mp3" 
start_time = "00:45:24" 
end_time = "00:47:28"   
output_path = r"C:\Spill\Punk Rock Samurai\github\Punk-Rock-Samurai\assets\sounds\output.mp3"  


cut_audio(file_path, start_time, end_time, output_path)
