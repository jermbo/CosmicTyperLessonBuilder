<script>
  // import LessonStepHTML from "./LessonStepHTML.svelte";

  const API_URL = "http://localhost:5001/typer/api";
  // const API_URL = "https://sampleapis.com/typer/api";

  const CATEGORY_TYPES = ["html-css", "general"];
  const DIFFICULTY_TYPES = ["easy", "medium", "hard"];
  const LESSON_TYPES = ["dom", "style"];

  let lesson = {
    title: "",
    category: "",
    difficulty: "",
    hasCompleted: false,
    steps: [],
  };

  function clearLessons() {
    lesson.steps = [];
  }

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
      action: [],
      render: true,
    };
    lesson.steps = [...lesson.steps, newStep];
  }

  function removeStep(index) {
    const remove = lesson.steps.splice(index, 1);
    lesson.steps = lesson.steps;
  }

  function saveLesson() {
    fetch(`${API_URL}/lessons`, {
      method: "POST",
      headers: {
        'Content-Type': "application/json",
      },
      body: JSON.stringify(lesson),
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log("success");
        console.log(data);
      })
      .catch(err=> {
        console.log(err)
      })
  }
</script>

<section class="container mx-auto bg-white shadow-md px-4 mt-4">
  <header
    class="header border-b-2 border-gray-400 py-4 mb-4 flex justify-between">
    <h1 class="text-2xl">Lesson Editor</h1>
    <button
      class="bg-teal-500 hover:bg-teal-700 text-teal-100 font-light py-2 px-4
      rounded tracking-wide"
      on:click={saveLesson}>
      Save Lesson
    </button>
  </header>
  <div class="flex">
    <div class="form-wrapper flex-auto w-1/2 pr-2">
      <div class="border-b-2 border-gray-400 p-2">
        <h2 class="text-lg font-bold">Lesson Form</h2>
      </div>

      <div class="form p-2">
        <!-- title -->
        <div class="mb-4">
          <label class="text-gray-700 text-sm font-bold" for="title">
            Title
          </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3
            text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Title"
            bind:value={lesson.title} />
        </div>
        <!-- /title -->

        <!-- category-->
        <div class="mb-4">
          <label class="text-gray-700 text-sm font-bold" for="category">
            Category
          </label>

          <div class="relative">
            <select
              name="category"
              class="block relative appearance-none w-full bg-white border
              border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded
              shadow leading-tight focus:outline-none focus:shadow-outline"
              bind:value={lesson.category}
              on:change={() => (lesson.steps = [])}>
              <option value="">Select a category</option>
              {#each CATEGORY_TYPES as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex
              items-center px-2 text-gray-700">
              <svg
                class="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20">
                <path
                  d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757
                  6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        <!-- /category -->

        <!-- difficulty -->
        <div class="mb-4">
          <label class="text-gray-700 text-sm font-bold" for="difficulty">
            Difficulty
          </label>

          <div class="relative">
            <select
              name="difficulty"
              class="block relative appearance-none w-full bg-white border
              border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded
              shadow leading-tight focus:outline-none focus:shadow-outline"
              bind:value={lesson.difficulty}>
              <option value="">Select a difficulty</option>
              {#each DIFFICULTY_TYPES as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex
              items-center px-2 text-gray-700">
              <svg class="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path
                  d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757
                  6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        <!-- /difficulty -->

        <hr class="mb-2" />

        <!-- General Section -->
        {#if lesson.category == 'general'}
          <div class="mb-4">
            <label for="typeSteps" class="text-gray-700 text-sm font-bold">
              General Steps
            </label>
            <textarea
              on:input={typingLesson}
              class="shadow appearance-none border rounded w-full py-2 px-3
              text-gray-700 leading-tight focus:outline-none
              focus:shadow-outline"
              id="typeSteps"
              rows="5" />
          </div>
        {/if}
        <!-- General Section -->

        <!-- HTML - CSS Steps -->
        {#if lesson.category == 'html-css'}
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4
            rounded w-full"
            on:click={addStep}>
            Add New Step
          </button>
          <hr class="my-2" />

          {#if lesson.steps.length && typeof lesson.steps[0] == 'object'}
            {#each lesson.steps as step, i}
              <div class="border-2 p-2 shadow-sm">
                <!-- Lesson Type -->
                <div class="mb-4">
                  <label class="text-gray-700 text-sm font-bold" for="type">
                    Lesson Type
                  </label>

                  <div class="relative">
                    <select
                      name="type"
                      class="block relative appearance-none w-full bg-white
                      border border-gray-400 hover:border-gray-500 px-4 py-2
                      pr-8 rounded shadow leading-tight focus:outline-none
                      focus:shadow-outline"
                      bind:value={lesson.steps[i].type}>
                      <option value="">Select a type</option>
                      {#each LESSON_TYPES as type}
                        <option value={type}>{type}</option>
                      {/each}
                    </select>
                    <div
                      class="pointer-events-none absolute inset-y-0 right-0 flex
                      items-center px-2 text-gray-700">
                      <svg
                        class="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20">
                        <path
                          d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10
                          10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <!-- Lesson Type -->

                <!-- Lesson Sescription -->
                <div class="mb-4">
                  <label class="text-gray-700 text-sm font-bold" for="desc">
                    Lesson Description
                  </label>
                  <input
                    class="shadow appearance-none border rounded w-full py-2
                    px-3 text-gray-700 leading-tight focus:outline-none
                    focus:shadow-outline"
                    id="type"
                    type="text"
                    bind:value={lesson.steps[i].desc}
                    placeholder="Lesson Description" />
                </div>
                <!-- Lesson Sescription -->

                <!-- Lesson Steps -->
                <div class="mb-4">
                  <label
                    for="typeSteps"
                    class="text-gray-700 text-sm font-bold">
                    General Steps
                  </label>
                  <textarea
                    on:input={codeLesson}
                    data-index={i}
                    class="shadow appearance-none border rounded w-full py-2
                    px-3 text-gray-700 leading-tight focus:outline-none
                    focus:shadow-outline"
                    id="typeSteps"
                    rows="5" />
                </div>
                <!-- Lesson Steps -->

                <button
                  class="bg-red-500 hover:bg-red-700 text-white font-bold p-2
                  text-sm rounded"
                  on:click={() => removeStep(i)}>
                  Remove Step {i + 1}
                </button>
              </div>
            {/each}
          {/if}
        {/if}
        <!-- HTML - CSS Steps -->

      </div>
    </div>
    <div class="display flex-initial w-1/2 pl-2">
      <div class="border-b-2 border-gray-400 p-2">
        <h2 class="text-lg font-bold">JSON Output</h2>
      </div>
      <pre class="text-xs p-2 overflow-x-auto">
        {JSON.stringify(lesson, null, 2)}
      </pre>
    </div>
  </div>
</section>
