<script>
  import { createEventDispatcher } from 'svelte'

  export let className = 'fader'
  export let id
  export let label = ''

  const dispatch = createEventDispatcher()
</script>

<div
  {id}
  class="element {className}">
  <div style="display:flex">
    <datalist class="markers">
      <option>-</option>
      <option>-</option>
      <option>-</option>
      <option>-</option>
      <option>-</option>
      <option class="unity">-</option>
      <option>-</option>
    </datalist>

    <input
      type="range"
      id="volume"
      min="0"
      max="1.2"
      value="1"
      step="0.01"
      on:input={(event) => {
        dispatch('fader', event.currentTarget.value)
      }} />

    <datalist class="markers">
      <option>-</option>
      <option>-</option>
      <option>-</option>
      <option>-</option>
      <option>-</option>
      <option class="unity">-</option>
      <option>-</option>
    </datalist>
  </div>
  <div class="label">{label}</div>
</div>

<style>
  .markers {
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-between;
  }
  .markers option {
    color: lightslategrey;
    font-weight: 100;
    padding: 0px;
  }
  .markers option.unity {
    color: black;
    font-weight: 900;
  }
  input[type='range'] {
    margin: 0;
  }

  #volume {
    writing-mode: vertical-lr;
    direction: rtl;
    vertical-align: top;
  }
  .label {
    height: 2.4em;
    overflow: hidden;
    width: fit-content;
    padding: 3px;
    border: solid black 1px;
    border-radius: 3px;
    margin-top: 5px;
    background-color: lightgoldenrodyellow;
  }
</style>
