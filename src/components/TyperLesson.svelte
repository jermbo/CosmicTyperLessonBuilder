<script>
  const API_URL = "http://localhost:5001/typer/lessons";

  const CATEGORY_TYPES = ["html-css", "general"];
  const DIFFICULTY_TYPES = ["easy", "medium", "hard"];
  const LESSON_TYPES = ["dom", "style"];

  let lesson = {
    title: "",
    category: "html-css",
    difficulty: "",
    hasCompleted: false,
    steps: []
  };

  function typingLesson({ target }) {
    const val = target.value.split("\n");
    lesson.steps = val;
  }
  function codeLesson(e) {
    const target = e.target;
    const val = target.value.split("\n");
    const index = +target.dataset.index;
    lesson.steps[index].action = val;
  }
  function addStep() {
    const newStep = {
      type: "",
      desc: "",
      action: [""],
      render: true
    };
    lesson.steps = [...lesson.steps, newStep];
  }
  function removeStep(index) {
    const remove = lesson.steps.splice(index, 1);
    lesson.steps = lesson.steps;
  }
</script>

<style lang="scss">
  .form-wrapper {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  pre {
    max-width: 50vw;
    overflow: auto;
  }
</style>

<div class="form-wrapper">
  <h1>Lesson Builder</h1>
  <div>
    <div>
      <label for="title">Title</label>
      <input id="title" type="text" bind:value={lesson.title} />
    </div>

    <div>
      <label for="category">Category</label>
      <select
        id="category"
        bind:value={lesson.category}
        on:change={() => (lesson.steps = [])}>
        <option value="">Select a category</option>
        {#each CATEGORY_TYPES as type}
          <option value={type}>{type}</option>
        {/each}
      </select>
    </div>

    <div>
      <label for="difficulty">Difficulty</label>
      <select id="difficulty" bind:value={lesson.difficulty}>
        <option value="">Select a difficulty</option>
        {#each DIFFICULTY_TYPES as type}
          <option value={type}>{type}</option>
        {/each}
      </select>
    </div>

    {#if lesson.category == 'general'}
      <label for="typeSteps">Steps</label>
      <textarea on:input={typingLesson} id="typeSteps" cols="30" rows="10" />
    {/if}

    {#if lesson.category == 'html-css'}
      <br />
      <hr />
      <button on:click={addStep}>Add New Step</button>
      <br />
      {#each lesson.steps as step, i}
        <div class="stepGroup">
          <div>
            <label for="difficulty">Difficulty</label>
            <select id="difficulty" bind:value={lesson.steps[i].type}>
              <option value="">Select a type</option>
              {#each LESSON_TYPES as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="desc">Lesson Desc</label>
            <input id="desc" type="text" bind:value={lesson.steps[i].desc} />
          </div>

          <div>
            <label for="lessonStep">Steps</label>
            <textarea
              on:input={codeLesson}
              data-index={i}
              id="lessonStep"
              cols="30"
              rows="10" />
          </div>

          <button on:click={() => removeStep(i)}>Remove Step {i + 1}</button>
        </div>
      {/each}
    {/if}

  </div>
  <div class="lesson-output">
    <h5>Lesson output</h5>
    <pre>{JSON.stringify(lesson, null, 2)}</pre>
  </div>
</div>
