# Täglicher Short-Ablauf (NullKommaNull)

Läuft jeden Tag als geplante Aufgabe. Ziel: **pro Tag 4 Shorts** – 2 für YouTube (werden automatisch geplant) und 2 für TikTok (Leonel postet selbst).

## Zeitplan (Europe/Berlin)
| Slot | YouTube | TikTok |
|---|---|---|
| Mittag | 13:00 | 13:00 |
| Abend | 18:00 | 18:00 |

Dateinamen: `YYYY-MM-DD-youtube-1300.mp4`, `YYYY-MM-DD-youtube-1800.mp4`, `YYYY-MM-DD-tiktok-1300.mp4`, `YYYY-MM-DD-tiktok-1800.mp4`.

## Kanäle
- **YouTube – NullKommaNull** (über Windsor.ai, Konnektor `youtube`, Aktion `upload_video`): KEIN Finanz-Fokus. Was in Deutschland gerade auf Shorts gut läuft: aktuelle Trendthemen, „Wusstest du?“-Fakten, Rätsel/Illusionen („Finde den Fehler“, „Nur 1 % …“), Mini-Storys. Veröffentlichung täglich **13:00 und 18:00 Europe/Berlin** (`privacy_status: private` + `publish_at`).
- **TikTok – Deutsch lernen**: Mini-Storys (A2–B1) mit mitlaufendem Text und Vorlesestimme oder Lern-Quiz. Windsor kann auf TikTok nicht posten → Video nur ins Repo legen und Leonel benachrichtigen.

## Schritte
1. `sh scripts/setup.sh` (installiert Remotion-Abhängigkeiten, Piper-Stimme).
2. Trends recherchieren (WebSearch, aktuelles Datum): Was ist heute/morgen in Deutschland Thema, was läuft auf YouTube Shorts DE (Top-Kanäle laut Socialblade: Tsuriki Show, Younes Zarou, boxtoxtv, Secret Vlog, German Spidey → schnelle Hooks, Rätsel, Überraschung). Fakten nur aus aktuellen Quellen.
3. `history.json` lesen → kein Thema, kein Wort, kein Hook wiederholen. Formate abwechseln.
4. Vier Specs schreiben (je Kanal und Slot, siehe Dateinamen oben; die zwei Videos eines Kanals pro Tag mit unterschiedlichem Format/Thema) (Format siehe vorhandene Specs; `type`: `story` oder `fehler`).
5. Rendern: `python3 scripts/make_video.py specs/<datei>.json videos/<datei>.mp4`. Vorher 2–3 Standbilder prüfen (`scripts/still.sh`) oder Frames aus dem fertigen Video ansehen.
6. Commit + Push nach `main`.
7. YouTube-Upload über Windsor `upload_video`: `video_url` = `https://raw.githubusercontent.com/mrleo-coder/nullkommanull-videos/main/videos/<datei>.mp4`, `made_for_kids: false`, `privacy_status: private`, `publish_at: <heute>T13:00:00+01:00` bzw. `T18:00:00+01:00` (Sommerzeit +02:00). Liegt ein Slot schon in der Vergangenheit, auf denselben Slot am nächsten Tag legen, Titel/Beschreibung/Tags aus der Spec.
8. `history.json` ergänzen (Datum, Kanal, Format, Thema, YouTube-Video-ID), committen, pushen.
9. Benachrichtigung an Leonel: die zwei YouTube-Links + die zwei TikTok-Videos (Links ins Repo) mit Uhrzeit, Titel und Hashtags zum Selbst-Posten.

## Regeln
- Jedes Video anders (Thema, Hook, Format) – YouTube bestraft wiederholte Massenware.
- Keine Musik oder Clips von Dritten, keine echten Personen nachahmen, keine erfundenen Fakten.
- Max. ~60 s, Hook in der ersten Sekunde, Frage am Ende für Kommentare.
