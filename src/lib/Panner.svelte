<script>
  import { createEventDispatcher } from 'svelte'

  export let className = 'panner'
  export let id = '' // stops error o chrome but empty id in DOM

  const dispatch = createEventDispatcher()
</script>

<div
  {id}
  class="element {className}"
  style="display: flex">
  <input
    type="range"
    id="pan"
    min="-1"
    max="1"
    value="0"
    step="0.1"
    on:input={(event) => {
      dispatch('panner', event.currentTarget.value)
    }} />
</div>

<style>
  input[type='range'] {
    margin: 5px;
  }
  #pan {
    width: 100%;
  }
</style>
