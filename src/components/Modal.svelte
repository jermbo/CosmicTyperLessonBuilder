<script>
  import { createEventDispatcher } from "svelte";

  import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "sveltestrap";

  const dispatch = createEventDispatcher();

  export let message = "";
  export let isOpen = false;

  function onNo() {
    dispatch("handleNo");
  }

  function onYes() {
    dispatch("handleYes");
  }
</script>

<Modal {isOpen} {onNo}>
  <ModalHeader>Modal title</ModalHeader>
  <ModalBody>{message}</ModalBody>
  <ModalFooter>
    <Button color="secondary" on:click={onNo}>Cancel</Button>
    <Button color="primary" on:click={onYes}>Yes</Button>
  </ModalFooter>
</Modal>
