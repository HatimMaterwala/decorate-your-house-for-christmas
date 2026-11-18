@echo off
rem Double-click to run Deck the House at http://localhost:5173
rem (YouTube songs only play when the site is opened from a web address, not as a file.)
cd /d "%~dp0"
start "" "http://localhost:5173"
where python >nul 2>nul && (python -m http.server 5173 & goto :eof)
where py >nul 2>nul && (py -m http.server 5173 & goto :eof)
echo Python was not found. Install it from https://www.python.org/downloads/ and try again.
pause
