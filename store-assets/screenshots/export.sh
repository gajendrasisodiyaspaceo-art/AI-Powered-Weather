#!/bin/bash
# Export framed Play Store screenshots as 1080x1920 PNGs
# Uses Chrome headless to capture each screenshot

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HTML_FILE="file://${SCRIPT_DIR}/framed-screenshots.html"
OUTPUT_DIR="${SCRIPT_DIR}/exported"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdir -p "$OUTPUT_DIR"

# Remove preview-mode and capture each frame
for i in 1 2 3 4 5 6; do
  case $i in
    1) name="01_home_light" ;;
    2) name="02_home_dark" ;;
    3) name="03_food_detail" ;;
    4) name="04_favorites" ;;
    5) name="05_settings" ;;
    6) name="06_login" ;;
  esac

  echo "Exporting screenshot $i: $name..."

  # Create a temporary HTML that shows only one frame at full size
  cat > "/tmp/ss_${i}.html" << HTMLEOF
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1920px; overflow: hidden; font-family: 'Poppins', sans-serif; }
  .frame {
    width: 1080px; height: 1920px; display: flex; flex-direction: column;
    align-items: center; position: relative; overflow: hidden;
  }
  .caption { padding: 80px 60px 30px; text-align: center; z-index: 2; }
  .caption h2 { font-size: 52px; font-weight: 800; color: #fff; line-height: 1.2; text-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .caption p { font-size: 24px; color: rgba(255,255,255,0.85); margin-top: 10px; font-weight: 500; }
  .phone-wrapper { flex: 1; display: flex; align-items: flex-end; justify-content: center; z-index: 2; padding: 0 60px; }
  .phone { width: 520px; border-radius: 36px 36px 0 0; overflow: hidden; box-shadow: 0 -10px 60px rgba(0,0,0,0.3); border: 8px solid #222; border-bottom: none; background: #222; }
  .phone img { width: 100%; display: block; margin-top: -80px; }
  .bg-orange { background: linear-gradient(160deg, #FF6B35, #E85A2A, #D44A1A); }
  .bg-dark { background: linear-gradient(160deg, #1a1a2e, #2d1b4e, #1a1a2e); }
  .bg-blue { background: linear-gradient(160deg, #3B82F6, #1D4ED8, #1E40AF); }
  .bg-green { background: linear-gradient(160deg, #10B981, #059669, #047857); }
  .bg-pink { background: linear-gradient(160deg, #EC4899, #DB2777, #BE185D); }
  .bg-purple { background: linear-gradient(160deg, #8B5CF6, #7C3AED, #6D28D9); }
  .frame::before { content: ''; position: absolute; top: -80px; right: -80px; width: 350px; height: 350px; background: rgba(255,255,255,0.08); border-radius: 50%; z-index: 1; }
  .frame::after { content: ''; position: absolute; bottom: 200px; left: -60px; width: 250px; height: 250px; background: rgba(255,255,255,0.05); border-radius: 50%; z-index: 1; }
</style>
</head>
<body>
HTMLEOF

  case $i in
    1) cat >> "/tmp/ss_${i}.html" << 'INNER'
<div class="frame bg-orange"><div class="caption"><h2>AI-Powered Food<br>for Every Weather</h2><p>Smart suggestions based on your location</p></div><div class="phone-wrapper"><div class="phone"><img src="IMGPATH/raw_home_light.png"></div></div></div>
INNER
    ;;
    2) cat >> "/tmp/ss_${i}.html" << 'INNER'
<div class="frame bg-dark"><div class="caption"><h2>Beautiful<br>Dark Mode</h2><p>Easy on the eyes, day and night</p></div><div class="phone-wrapper"><div class="phone"><img src="IMGPATH/raw_home_dark.png"></div></div></div>
INNER
    ;;
    3) cat >> "/tmp/ss_${i}.html" << 'INNER'
<div class="frame bg-green"><div class="caption"><h2>Detailed<br>Food Info</h2><p>Ingredients, calories & one-tap recipes</p></div><div class="phone-wrapper"><div class="phone"><img src="IMGPATH/raw_food_detail.png"></div></div></div>
INNER
    ;;
    4) cat >> "/tmp/ss_${i}.html" << 'INNER'
<div class="frame bg-pink"><div class="caption"><h2>Save Your<br>Favorites</h2><p>Quick access to dishes you love</p></div><div class="phone-wrapper"><div class="phone"><img src="IMGPATH/raw_favorites.png"></div></div></div>
INNER
    ;;
    5) cat >> "/tmp/ss_${i}.html" << 'INNER'
<div class="frame bg-blue"><div class="caption"><h2>Personalized<br>For You</h2><p>Diet, health goals & language preferences</p></div><div class="phone-wrapper"><div class="phone"><img src="IMGPATH/raw_settings_light.png"></div></div></div>
INNER
    ;;
    6) cat >> "/tmp/ss_${i}.html" << 'INNER'
<div class="frame bg-purple"><div class="caption"><h2>Easy &<br>Secure Login</h2><p>Your data stays private and safe</p></div><div class="phone-wrapper"><div class="phone"><img src="IMGPATH/raw_login.png"></div></div></div>
INNER
    ;;
  esac

  echo "</body></html>" >> "/tmp/ss_${i}.html"

  # Replace IMGPATH with actual path
  sed -i '' "s|IMGPATH|${SCRIPT_DIR}|g" "/tmp/ss_${i}.html"

  # Capture with Chrome headless
  "$CHROME" --headless --disable-gpu --screenshot="${OUTPUT_DIR}/${name}.png" \
    --window-size=1080,1920 --hide-scrollbars --default-background-color=0 \
    "file:///tmp/ss_${i}.html" 2>/dev/null

  if [ -f "${OUTPUT_DIR}/${name}.png" ]; then
    echo "  Saved: exported/${name}.png"
  else
    echo "  FAILED: Could not export ${name}.png"
  fi
done

echo ""
echo "Done! Screenshots saved to: ${OUTPUT_DIR}/"
echo "Upload these to Google Play Console."
