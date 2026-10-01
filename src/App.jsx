import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "27-days-habits";
const HEALTH_LOSS_PER_MISSED_DAY = 20;
const HEALTH_RECOVERY_PER_SUCCESS = 10;

function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createPlant(plantedOnDay, age = 0) {
  return {
    id: crypto.randomUUID(),
    plantedOnDay,
    age,
    health: 100,
    alive: true,
  };
}

function createHabit(name) {
  const today = getToday();

  return {
    id: crypto.randomUUID(),
    name,
    plantType: "sunflower",
    createdAt: new Date().toISOString(),

    successfulDays: 0,

    lastCompleted: null,
    lastChecked: today,

    plants: [
      createPlant(1),
    ],
  };
}

function normalizeHabit(habit) {
  return {
    id: habit.id || crypto.randomUUID(),
    name: habit.name || "Unnamed Habit",
    plantType: habit.plantType || "sunflower",
    createdAt: habit.createdAt || new Date().toISOString(),

    successfulDays: Number(habit.successfulDays) || 0,

    lastCompleted: habit.lastCompleted || null,
    lastChecked: habit.lastChecked || habit.lastCompleted || getToday(),

    plants: Array.isArray(habit.plants)
      ? habit.plants.map((plant) => ({
          id: plant.id || crypto.randomUUID(),
          plantedOnDay: Number(plant.plantedOnDay) || 1,
          age: Number(plant.age) || 0,
          health: Number(plant.health) || 100,
          alive: plant.alive !== false,
        }))
      : [createPlant(1)],
  };
}

function loadHabits() {
  try {
    const savedHabits = localStorage.getItem(STORAGE_KEY);

    if (!savedHabits) {
      return [];
    }

    const parsedHabits = JSON.parse(savedHabits);

    if (!Array.isArray(parsedHabits)) {
      return [];
    }

    return parsedHabits.map(normalizeHabit);
  } catch (error) {
    console.error("Could not load habits:", error);
    return [];
  }
}

function getDaysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const difference = end - start;

  return Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );
}

function applyMissedDays(habit, today) {
  if (!habit.lastChecked) {
    return {
      ...habit,
      lastChecked: today,
    };
  }

  const daysPassed = getDaysBetween(habit.lastChecked,today);

  if (daysPassed <= 0) {
    return habit;
  }

  const missedDays = Math.min(0, daysPassed - 1);

  if (missedDays === 0) {
    return {
      ...habit,
      lastChecked: today,
    };
  }

  const updatedPlants = habit.plants.map((plant) => {
    if (!plant.alive) {
      return plant;
    }

    const newHealth = Math.max(0,plant.health - missedDays * HEALTH_LOSS_PER_MISSED_DAY);

    return {
      ...plant,
      health: newHealth,
      alive: newHealth > 0,
    };
  });

  return {
    ...habit,
    plants: updatedPlants,
    lastChecked: today,
  };
}

function getPlantEmoji(plant) {
  // Dead plant
  if (!plant.alive || plant.health <= 0) {
    return "💀";
  }

  // Severely unhealthy
  if (plant.health <= 40) {
    return "🥀";
  }

  // Growth stages
  if (plant.age < 7) {
    return "🌰";
  }

  if (plant.age < 14) {
    return "🌱";
  }

  if (plant.age < 21) {
    return "🌿";
  }

  if (plant.age < 27) {
    return "🌷";
  }

  return "🌻";
}

function App() {
  const [habits, setHabits] = useState(loadHabits);
  const [newHabit, setNewHabit] = useState("");
  const [gardenOpen,setGardenOpen] = useState(false);

  useEffect(() => {
    const today = getToday();

    setHabits((currentHabits) =>
      currentHabits.map((habit) =>
        applyMissedDays(habit, today)
      )
    );
  }, []);

  /*
   * Save whenever habits change.
   */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(habits)
    );
  }, [habits]);

  function addHabit() {
    const name = newHabit.trim();

    if (!name) {
      return;
    }

    const habit = createHabit(name);

    setHabits((currentHabits) => [
      ...currentHabits,
      habit,
    ]);

    setNewHabit("");
  }

  function completeHabit(habitId) {
    const today = getToday();

    setHabits((currentHabits) =>
      currentHabits.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }

        if (habit.lastCompleted === today) {
          return habit;
        }

        /*
         * Before completing today,
         * process any days that were missed.
         */
        const checkedHabit = applyMissedDays(
          habit,
          today
        );

        const newSuccessfulDays =
          checkedHabit.successfulDays + 1;

        const updatedPlants =
          checkedHabit.plants.map((plant) => {
            if (!plant.alive) {
              return plant;
            }

            return {
              ...plant,

              // Plant grows
              age: plant.age + 1,

              // Successful completion restores
              // some health.
              health: Math.min(
                100,
                plant.health +
                  HEALTH_RECOVERY_PER_SUCCESS
              ),
            };
          });

        /*
         * Every 7 successful days,
         * create a new plant.
         */
        if (newSuccessfulDays % 7 === 0) {
          updatedPlants.push(
            createPlant(newSuccessfulDays)
          );
        }

        return {
          ...checkedHabit,

          successfulDays: newSuccessfulDays,
          lastCompleted: today,
          lastChecked: today,

          plants: updatedPlants,
        };
      })
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>27 Days</h1>
        <p>Visualise your growth</p>
      </header>

      <main>
        {/* GARDEN */}

        <section className="garden-preview-section">
          <h2>Your Garden</h2>

          <div
            className="garden-window"
            onClick={() => setGardenOpen(true)}
          >
            {habits.length === 0 ? (
              <div className="empty-garden">
                <span>🌱</span>
                <p>Your garden is waiting...</p>
              </div>
            ) : (
              <div className="garden-preview">
                {habits.map((habit) => (
                  <div
                    className="preview-patch"
                    key={habit.id}
                  >
                    <h3>{habit.name}</h3>

                    <div className="preview-plants">
                      {habit.plants
                        .slice(0, 8)
                        .map((plant) => (
                          <span
                            className="preview-plant"
                            key={plant.id}
                          >
                            {getPlantEmoji(plant)}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="garden-window-label">
              <span>Open Garden</span>
              <span>↗</span>
            </div>
          </div>
        </section>

        {/* HABITS */}

        <section className="habits-section">
          <h2>Habits</h2>

          <div className="add-habit">
            <input
              type="text"
              placeholder="What are you growing?"
              value={newHabit}
              onChange={(event) =>
                setNewHabit(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addHabit();
                }
              }}
            />

            <button onClick={addHabit}>
              Add Habit
            </button>
          </div>

          <div className="habit-list">
            {habits.map((habit) => {
              const completedToday =
                habit.lastCompleted === getToday();

              return (
                <div
                  className="habit-card"
                  key={habit.id}
                >
                  <div>
                    <h3>{habit.name}</h3>

                    <p>
                      {habit.successfulDays} successful day
                      {habit.successfulDays !== 1
                        ? "s"
                        : ""}
                    </p>

                    <p>
                      {habit.plants.length} total plant
                      {habit.plants.length !== 1
                        ? "s"
                        : ""}
                    </p>

                    <p>
                      Health:{" "}
                      {habit.plants.length > 0
                        ? habit.plants[0].health
                        : 0}
                      %
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      completeHabit(habit.id)
                    }
                    disabled={completedToday}
                  >
                    {completedToday
                      ? "Completed ✓"
                      : "Complete"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      {gardenOpen && (
      <div className="garden-overlay">
        <div className="full-garden">
          <div className="garden-header">
            <div>
              <h2>My Garden</h2>
              <p>Everything you've grown.</p>
            </div>

            <button
              className="close-garden"
              onClick={() => setGardenOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="garden-patches">
            {habits.map((habit) => (
              <div
                className="garden-patch"
                key={habit.id}
              >
                <div className="patch-header">
                  <div>
                    <h3>{habit.name}</h3>

                    <p>
                      {habit.successfulDays} successful days
                    </p>
                  </div>

                  <span>
                    {habit.plants.length} plants
                  </span>
                </div>

                <div className="patch-plants">
                  {habit.plants.map((plant) => (
                    <div
                      className="full-plant"
                      key={plant.id}
                    >
                      <span className="full-plant-emoji">
                        {getPlantEmoji(plant)}
                      </span>

                      <small>
                        Day {plant.age}
                      </small>

                      <small>
                        {plant.health}% health
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default App;