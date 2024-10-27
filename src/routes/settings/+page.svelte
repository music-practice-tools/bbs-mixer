<script>
  import Layout from '../+layout.svelte'
  import { settings } from '$lib/persistentStore.js'
</script>

<fieldset>
  <legend>Settings:</legend>

  <div>
    <input
      type="checkbox"
      id="pan"
      bind:checked={$settings.showPans} />
    <label for="Pan">Show pan controls</label>
  </div>
</fieldset>

<style>
  legend {
    font-weight: bold;
    font-size: larger;
  }
</style>
