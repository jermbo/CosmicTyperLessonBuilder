<script>
  import { onMount } from "svelte";
  import { Container, Row, Col, Button } from "sveltestrap";
  import LessonList from "./LessonList.svelte";
  import LessonDetail from "./LessonDetail.svelte";
  import { Modal, PageHeader } from "../../components";

  import {
    state,
    getTypingLessonsAction,
    deleteTypingLessonAction,
    updateTypingLessonAction,
    addTypingLessonAction,
  } from "../../store";

  const { typingLessons } = state;

  let selected = undefined;
  let title = "Typing Lessons";
  let lessonToDelete = null;
  let message = "";
  let showModal = false;

  onMount(async () => await getTypingLessons());

  async function getTypingLessons() {
    await getTypingLessonsAction();
  }

  function enableAddModule() {
    selected = {};
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
      await deleteTypingLessonAction(lessonToDelete);
    }
    clear();
  }

  function clear() {
    console.log("clear");
    selected = undefined;
  }

  function select({ detail: lesson }) {
    selected = lesson;
    console.log(`You selected ${lesson.title}`);
  }

  function closeModal() {
    showModal = false;
  }

  async function save({ detail: lesson }) {
    let theLesson;
    if (lesson.id) {
      theLesson = await updateTypingLessonAction(lesson);
    } else {
      theLesson = await addTypingLessonAction(lesson);
    }
  }
</script>

<Container>
  <Row>
    <Col>
      <PageHeader {title} on:newLesson={enableAddModule} />
    </Col>
  </Row>
  {#if $typingLessons}
    <Row>
      <Col>
        {#if !selected}
          <LessonList
            lessons={$typingLessons}
            on:deleted={askToDelete}
            on:selected={select} />
        {:else}
          <LessonDetail lesson={selected} on:unselect={clear} on:save={save} />
        {/if}

      </Col>
    </Row>
  {/if}

  <Modal
    {message}
    isOpen={showModal}
    on:handleNo={closeModal}
    on:handleYes={deleteLesson} />
</Container>
