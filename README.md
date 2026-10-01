#  27 Days

**27 Days** is a visual habit-growth app where your **garden is the habit tracker**.

Instead of tracking habits through checkboxes, streaks, or numbers, each habit grows its own collection of plants. Consistency helps the plants grow, while missed days affect their health.

The goal is simple: **build a garden by showing up.**

##  How It Works

* Create a habit you want to maintain.
* Each habit gets its own garden patch.
* A plant grows through a **27-day growth cycle**.
* A new plant is added to the habit's collection every **7 successful days**.
* Completing a habit increases plant age and can restore plant health.
* Missing days affects plant health rather than resetting its growth.
* Your entire garden is saved locally, so it persists between sessions.

###  Plant Growth

| Days  | Growth Stage |
| ----- | ------------ |
| 0–6   | Seed         |
| 7–13  | Sprout       |
| 14–20 | Young Plant  |
| 21–26 | Bud          |
| 27+   | Fully Grown  |

###  Plant Health

Plants don't lose their age when a habit is missed.

Instead, their health decreases depending on how many days were missed.

As health drops, plants visually change:

* Healthy → normal growth
* Low health → wilting
* Critical health → dying
* Dead → remains in the garden as part of its history

Completing the habit again restores some health.

##  Built With

* **React**
* **JavaScript**
* **CSS**
* **Vite**
* **localStorage**

No backend or database is required for the current version.

##  Project Structure

```text
27-days/
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
└── README.md
```

##  Running Locally

Clone the repository:

```bash
git clone <your-repository-url>
```

Navigate into the project:

```bash
cd 27-days
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL provided by Vite.

##  Data Persistence

Habit and plant data is stored using the browser's `localStorage`.

This means the current version:

* works without an account
* requires no backend
* persists data across page refreshes
* stores the garden locally on the user's device

##  Future Ideas

The current version intentionally keeps the project small, but possible future directions include:

* Custom pixel-art plant sprites
* More plant species
* More detailed garden environments
* A walkable garden mode
* Additional garden interactions
* Improved animations and environmental effects

---

## Author

Ishika R Dev
