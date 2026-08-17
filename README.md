# Deskling

A tiny desktop companion for makers.

Deskling wakes up when you work, gets sleepy when you drift away, and celebrates when you ship something.

## v0.1.1 (26.08.17)

- Small frameless desktop window
- Active, idle, sleepy, and celebrating states
- Local activity detection inside the app window
- Manual "I shipped something" celebration
- Egg, cracked egg, sprout, and Deskling growth stages
- Growth points from active time, shipped work, and planted grass
- Tiny local garden saved on the device

## Run

```sh
npm install
npm start
```

## Build macOS prototype

```sh
npm run dist:mac
```

The generated `.dmg` is an unsigned prototype build. On macOS, first-time testers may need to use right-click, then Open.

## Future ideas

- GitHub or local Git commit activity as growth input
- React to local Git commits
- React to build success/failure
- Add menu bar controls
- Signed macOS releases
- Windows package
