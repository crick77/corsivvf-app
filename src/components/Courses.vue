<template>
    <div class="ui container">
        <table class="ui celled table">
            <thead>
                <th>Titolo</th>
                <th>Descrizione</th>
                <th>Creazione</th>
                <th>Aggiornamento</th>
                <th>Abilitato</th>
                <th width="8%" class="center aligned"><i class="icon cogs" title="Azioni"/></th>
            </thead>
            <tbody v-if="!loading">
                <tr v-for="course in courses" :key="course.id">
                    <td>{{ course.titolo }}</td>
                    <td>{{ course.descrizione }}</td>
                    <td>{{ course.dataCreazione | formatDate }}</td>
                    <td>{{ course.dataAggiornamento | formatDate }}</td>
                    <td class="center aligned"><imageFlag v-bind:value="course.abilitato" trueClass="check" falseClass="close" /></td>
                    <td class="center aligned">
                        <router-link :to="{ name: 'course', params: {courseid: course.id} }">
                            <i class="icon pencil" title="Modifica" />
                        </router-link>&nbsp;                        
                        <i class="icon eraser" title="Modifica" @click="removeCourse(key)" />                        
                    </td>
                </tr>
                <tr v-if="courses.length == 0">
                    <td colspan="6" class="center aligned">Nessun corso in archivio.</td>
                </tr>
            </tbody>
            <tbody v-if="loading">
                <tr>
                    <td colspan="6" class="center aligned">
                        <img src='../assets/spinning.gif' />
                    </td>
                </tr>
            </tbody>
            <tfoot v-if="(courses.length != 0) && (!loading)">
                <th colspan="5">{{ courses.length }} corsi in archivio.</th>
                <th class="center aligned"><i @click="refresh" class="icon refresh pointer" title="Aggiorna" /></th>
            </tfoot>
        </table>
        <div class="ui error message" v-if="error">Errore del server.</div>
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
            courses: [],
            loading: true,
            error: false
        }
    },
    created() {
        this.refresh();
    },
    methods: {
        refresh() {
            this.courses = [];
            this.loading = true;
            this.error = false;

            let headers = new Headers();
            if(this.$store.state.userToken!=null) {
                headers.append("Authorization", "Bearer "+this.$store.state.userToken);
            }

            let initParams = { 
                headers: headers,
                mode: 'cors',
                cache: 'default'
            };

            fetch('http://localhost:8080/Corsi-VVF-web/api/courses', initParams)
                    .then(listResponse => {
                        console.log("Response ok? "+listResponse.ok);
                        if(!listResponse.ok) {
                            throw Error(listResponse.status)
                        }
                        return listResponse;
                    })
                    .then(jsonResponse => jsonResponse.json())
                    .then(urlList => {
                        urlList.forEach(url => {
                        fetch(url, initParams)
                            .then(itemResponse => itemResponse.json())
                            .then(item => this.courses.push(item));      
                        })
                    })
                    .then(() => {
                        window.setTimeout(() => {
                            console.log("FINISHED!!");
                            this.loading = false;
                        }, 2000);
                    })
                    .catch(error => {
                        console.log("ERROR: "+error.message);
                        switch(error.message) {
                            case '401': {
                                console.log("Going to home...");
                                this.$router.push('/');
                                break;
                            }
                            default: {
                                this.error = true;
                            }
                        }
                    });
        },

        removeCourse(id) {
            console.log("Deleting: "+id);
        }
    }
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

    i.pointer:hover {
        cursor: pointer;
    }
</style>