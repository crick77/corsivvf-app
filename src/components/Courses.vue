<template>
    <div class="ui container">
        <table class="ui celled table">
            <thead>
                <th>Titolo</th>
                <th>Descrizione</th>
                <th>Creazione</th>
                <th>Aggiornamento</th>
                <th>Abilitato</th>
            </thead>
            <tbody>
                <tr v-for="course in courses" :key="course.id">
                    <td>{{ course.titolo }}</td>
                    <td>{{ course.descrizione }}</td>
                    <td>{{ course.dataCreazione | formatDate }}</td>
                    <td>{{ course.dataAggiornamento | formatDate }}</td>
                    <td class="center aligned"><imageFlag v-bind:value="course.abilitato" trueClass="check" falseClass="close" /></td>
                </tr>
                <tr v-if="courses.length == 0">
                    <td colspan="5" class="center aligned">No courses</td>
                </tr>
            </tbody>
            <tfoot v-if="courses.length != 0">
                <th colspan="5">{{ courses.length }} courses.</th>
            </tfoot>
        </table>
    </div>
</template>

<script>
import ImageFlag from './ImageFlag'

export default {
    name: 'Courses',
    components: {
        ImageFlag
    },
    data() {
        return {
            textformat: '',
            courses : []
        }
    },
    created() {
        fetch('http://localhost:8080/Corsi-VVF-web/api/courses')
        .then(listResponse => listResponse.json())
        .then(urlList =>  {
            urlList.forEach(url => {
               fetch(url)
                .then(itemResponse => itemResponse.json())
                .then(item => this.courses.push(item));      
            });
        })
    },
}
</script>

<style>
    h1.ui.center.header {
        margin-top: 3em;
    }

    .ui.table th:not(:first-child):hover {
        cursor: pointer;
    }

    .ui.table tr:hover {
        background-color: rgb(246, 246, 246);
    }
</style>