<script>
  export let title = "";
</script>

<div class="my-4 d-flex justify-content-between">
  <h3>{title}</h3>
  <div class="actions">
    <slot />
  </div>
</div>
