New-Item -ItemType Directory -Force -Path 'public/audio'
Add-Type -AssemblyName System.Speech

# Scam call clip with authority, urgency, secrecy, and isolation phrases
$synth1 = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth1.SetOutputToWaveFile("$PSScriptRoot/../public/audio/scam_call_sample.wav")
$synth1.Speak("This is your CEO. Bank security and the compliance officer require you to transfer immediately right now. Keep this confidential and do not tell anyone. Use this number only.")
$synth1.Dispose()

# Normal legitimate call clip
$synth2 = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth2.SetOutputToWaveFile("$PSScriptRoot/../public/audio/normal_call_sample.wav")
$synth2.Speak("Hi Sarah, just following up on the invoice for the office supplies. Whenever you have a chance, please approve it. Thanks so much.")
$synth2.Dispose()

Write-Host "Demo audio clips generated successfully!"
