<template>
    <div class="ui container">        
        <div class="ui form">
            <div class="inline fields">
                <div class="field">
                    <Logout/>
                </div>
                <div class="field">
                    <label for="filter">Filtro: </label><input type="text" v-model="filter" /> 
                </div>
                <div class="field">
                    <label>Mostra</label>
                    <select class="ui search dropdown" v-model="show">
                        <option value="all">Tutti</option>
                        <option value="true">Abilitati</option>
                        <option value="false">Disabilitati</option>
                    </select>
                </div>
                <div class="field">
                    <button @click="refresh" class="ui violet button">Applica</button>
                </div>
            </div>
        </div>
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
                        <router-link tag="i" class="icon pencil pointer" title="Modifica" :to="{ name: 'course', params: {courseid: course.id} }" />
                        <i class="icon eraser pointer" title="Elimina" @click="removeCourse(course.id, course.titolo)" />                        
                        <router-link tag="i" class="icon copy pointer" title="Documenti" :to="{ name: 'docs', params: { parentids: course.id} }" />
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
        <button type="button" class="ui primary button" v-on:click="addNew">Nuovo</button>
        <button type="button" class="ui brown button" @click="showDevices">Dispositivi</button>
        <div class="ui error message" v-if="error">{{ errorMessage }}</div>
    </div>
</template>

<script>
import ImageFlag from './ImageFlag'
import Logout from './Logout'

export default {
    name: 'Courses',
    components: {
        ImageFlag,
        Logout
    },
    data() {
        return {
            courses: [],
            loading: true,
            error: false,
            errorMessage : null,
            filter: null,
            show: 'all'
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

            let queryStr = "";
            if(this.filter) {
                queryStr = queryStr+"q="+this.filter;
            }
            if(this.show!='all') {
                if(queryStr) queryStr=queryStr+"&";
                queryStr = queryStr+"enabled="+this.show;
            }
            if(queryStr) queryStr="?"+queryStr;

            let initParams = { 
                headers: headers,
                mode: 'cors',
                cache: 'default'
            };

            fetch('http://localhost:8080/Corsi-VVF-web/api/courses'+queryStr, initParams)
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
                        }, 1000);
                    })
                    .catch(error => {
                        this.loading = false;
                        console.log("ERROR: "+error.message);
                        if(!error.response) {
                            this.error = true;
                            this.errorMessage = 'Comunicazione con il server fallita.';
                            return;
                        }
                        switch(error.message) {
                            case '401': {
                                console.log("Going to home...");
                                this.$router.push('/');
                                break;
                            }
                            case '422': {
                                this.error = true;
                                this.errorMessage = "Dati non validi, verificare.";
                                break;
                            }
                            case '409': {
                                this.error = true;
                                this.errorMessage = "Le informazioni inserite esistono già. Verificare.";
                                break;
                            }
                            case '404': {
                                this.error = true;
                                this.errorMessage = "L'informazione richiesta non è più disponibile. Riprovare.";
                                break;
                            }
                            case '400': {
                                this.error = true;
                                this.errorMessage = "La richiesta conteneva errori. Verificare.";
                                break;
                            }
                            case '500': {
                                this.error = true;
                                this.errorMessage = "Errore nel server. Contattare il supporto.";
                                break;
                            }
                            default: {
                                this.error = true;
                                this.errorMessage = "Errore sconosciuto contattare il supporto ("+error.message+").";
                            }
                        }
                    });
        },
        removeCourse(id, title) {
            console.log("Deleting: "+id+", "+title);
            if(id!=null) {
                if(window.confirm("Eliminare il corso "+title)) {
                    let headers = new Headers();
                    if(this.$store.state.userToken!=null) {
                        headers.append("Authorization", "Bearer "+this.$store.state.userToken);
                    }

                    let initParams = { 
                        method: 'DELETE',
                        headers: headers,
                        mode: 'cors',
                        cache: 'default'
                    };

                    fetch('http://localhost:8080/Corsi-VVF-web/api/courses/'+id, initParams)
                    .then(response => {
                        if(!response.ok) {
                            throw Error(response.status);
                        }
                        return response;
                    })
                    .then(() => {
                        this.refresh();                        
                    })
                    .catch(error => {                    
                        console.log("ERROR: "+error.message);
                        if(!error.response) {
                            this.error = true;
                            this.errorMessage = 'Comunicazione con il server fallita.';
                            return;
                        }
                        switch(error.message) {
                            case '401': {
                                console.log("Going to home...");
                                this.$router.push('/');
                                break;
                            }
                            case '422': {
                                this.error = true;
                                this.errorMessage = "Dati non validi, verificare.";
                                break;
                            }
                            case '409': {
                                this.error = true;
                                this.errorMessage = "Le informazioni inserite esistono già. Verificare.";
                                break;
                            }
                            case '404': {
                                this.error = true;
                                this.errorMessage = "L'informazione richiesta non è più disponibile. Riprovare.";
                                break;
                            }
                            case '400': {
                                this.error = true;
                                this.errorMessage = "La richiesta conteneva errori. Verificare.";
                                break;
                            }
                            case '500': {
                                this.error = true;
                                this.errorMessage = "Errore nel server. Contattare il supporto.";
                                break;
                            }
                            default: {
                                this.error = true;
                                this.errorMessage = "Errore sconosciuto contattare il supporto ("+error.message+").";
                            }
                        }
                    });
                }
            }
        },
        addNew() {
            this.$router.push({name: 'course'});
        },
        showDevices() {
            this.$router.push({name: 'devices'});
        }
    }
}
</script>

<style>
    h1.ui.center.header {
        margin-top: 3em;
    }

    /*.ui.table th:not(:first-child):hover {
        cursor: pointer;
    }*/

    .ui.table tr:hover {
        background-color: rgb(246, 246, 246);
    }

    i.pointer:hover {
        cursor: pointer;
    }
</style>