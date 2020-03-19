<script>
  import { onMount } from "svelte";
  import {
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Container,
    Row,
    Col,
    Button,
  } from "sveltestrap";
  import LessonList from "./LessonList.svelte";
  import { Modal } from "../../components";

  import {
    state,
    getWebLessonsAction,
    deleteWebLessonAction,
  } from "../../store";

  const { webLessons } = state;

  let selected = undefined;
  let title = "Web Lessons";
  let lessonToDelete = null;
  let message = "";
  let showModal = false;

  onMount(async () => await getWebLessons());

  async function getWebLessons() {
    await getWebLessonsAction();
  }

  function askToDelete({ detail: lesson }) {
    console.log(lesson);
    lessonToDelete = lesson;
    showModal = true;
    if (lessonToDelete.title) {
      message = `Would you like to delete ${lessonToDelete.title}?`;
    }
  }

  async function deleteLesson() {
    closeModal();
    if (lessonToDelete) {
      console.log(`You said you want to delete ${lessonToDelete.title}`);
      await deleteWebLessonAction(lessonToDelete);
    }
    clear();
  }

  function clear() {
    selected = null;
  }

  function select() {}

  function closeModal() {
    showModal = false;
  }
</script>

<Container>
  <h2>Web Lessons</h2>
  {#if $webLessons}
    <Row>
      <Col>
        <LessonList
          lessons={$webLessons}
          on:deleted={askToDelete}
          on:selected={select} />
      </Col>
    </Row>
  {/if}

  <Modal
    {message}
    isOpen={showModal}
    on:handleNo={closeModal}
    on:handleYes={deleteLesson} />
</Container>
