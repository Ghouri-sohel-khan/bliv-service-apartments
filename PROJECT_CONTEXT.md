# BLIV Service Apartments — Project Context

## 1. Project Overview
- Static HTML/CSS/JavaScript website
- BLIV Service Apartments
- Multi-property service apartment website
- Properties:
  - Baitu-l-Amaan
  - Banjara Hills
  - Hill Plaza Shaikhpet
  - Abbasi Tower

## 2. Repository
GitHub:
https://github.com/Ghouri-sohel-khan/bliv-service-apartments.git

Production branch:
main

## 3. Baitu-l-Amaan Official Address
The official address is:

10-1-50, Veer Nagar, Chintal, Hyderabad, Telangana 500004

This address must NOT be changed back to Irram Manzil or any previous address unless explicitly instructed by the project owner.

## 4. Baitu-l-Amaan Address Updates
The address was updated in:
- Homepage
- Baitu-l-Amaan standalone page
- Configuration Specs
- Property data
- Chatbot knowledge/intent handling
- Google Maps link

Google Maps destination:
https://maps.google.com/?q=10-1-50,+Veer+Nagar,+Chintal,+Hyderabad,+Telangana+500004

## 5. Chatbot
The chatbot is integrated into the website.

For the query:
"Where is Baitu-l-Amaan?"

the expected response is:

"Baitu-l-Amaan is located at 10-1-50, Veer Nagar, Chintal, Hyderabad, Telangana 500004."

Do not reintroduce outdated Irram Manzil location information.

Important chatbot-related files include:
- concierge.js
- data/properties.js
- data/nearbyPlaces.js
- data/chatbotConfig.js
- data/faq.js
- data/hyderabadGuide.js

## 6. Cinematic Luxury Motion System
A cinematic motion system has been implemented.

Features include:
- Scroll-driven inset image morphs/parallax
- Premium magnetic buttons
- Amenities hover micro-interactions
- Property page transition mask overlays
- GPU-friendly transforms
- Mobile-specific behavior
- Reduced-motion accessibility support

Main animation files:
- motion.js
- style.css
- index.html
- property page HTML files

## 7. Animation Behavior
Desktop:
- Enable magnetic cursor/button interactions
- Enable hover micro-interactions
- Enable scroll-driven motion

Touch/mobile:
- Disable desktop-only hover behavior
- Disable custom cursor behavior
- Avoid unnecessary mouse tracking
- Prevent horizontal overflow

Accessibility:
Respect:
prefers-reduced-motion

When reduced motion is enabled:
- Disable page transition animation
- Disable cursor morphing
- Disable unnecessary transforms/motion

## 8. Validation Status
The latest validation confirmed:
- JavaScript syntax: PASS
- Homepage HTTP response: PASS
- Baitu-l-Amaan HTTP response: PASS
- Address data: PASS
- Chatbot: PASS
- Browser/CDP: PASS
- Runtime errors: NONE
- Console errors: NONE
- Horizontal mobile overflow: NONE

## 9. Backup
A baseline backup exists at:

.backup_baselive/

Do not delete this backup without explicit approval.

## 10. Latest Git Commit
Latest known cinematic motion system commit:

f3f65baf2d73cd914337e352da31a2fa8ca5487c

Commit message:
feat: Integrate Cinematic Luxury Motion System and Page Transition Mask Overlays

## 11. Deployment Status
The repository is connected to GitHub.

Do NOT assume Vercel, Netlify, or GitHub Pages without verification.

Before deployment:
1. Verify the actual production hosting platform.
2. Verify the production URL.
3. Confirm the latest main branch commit is deployed.
4. Perform production smoke testing.

## 12. Critical Development Rule
Before modifying production code:
- Inspect the existing implementation first.
- Do not unnecessarily rewrite working files.
- Do not remove existing chatbot functionality.
- Do not change the Baitu-l-Amaan address without explicit instruction.
- Do not remove the baseline backup.
- Test modified JavaScript for syntax errors.
- Perform lightweight runtime validation after changes.

## 13. Current Project State
The local project and GitHub repository contain the latest verified cinematic motion system and Baitu-l-Amaan address update.

Do not make any additional changes merely from reading this document.
