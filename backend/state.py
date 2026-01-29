class AppState:
    def __init__(self):
        self.last_uploaded_text = ""
        self.last_uploaded_filename = ""
        self.last_uploaded_type = "" # 'pdf', 'audio', 'video'
        self.transcription_segments = [] # For timestamped lookup

global_state = AppState()
