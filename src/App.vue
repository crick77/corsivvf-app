<template>
  <div id="app">
    <h1 class="ui center aligned header">Elenco Corsi</h1>
    <Courses />
  </div>
</template>

<script>
import 'semantic-ui-css/semantic.css'
import Courses from './components/Courses.vue'

export default {
  name: 'app',
  components: {
    Courses
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
