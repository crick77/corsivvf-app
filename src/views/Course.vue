<template>
    <div class="ui container">
        <form class="ui form" @submit.prevent="onSubmit">
            <h4 class="ui dividing header">{{ pageName }} corso</h4>
            <div class="field required">
                <label>Titolo</label>
                <input type="text" placeholder="Titolo" v-model="course.titolo">
            </div>
            <div class="field required">
                <label>Descrizione</label>
                <input type="text" placeholder="Descrizione" v-model="course.descrizione">
            </div>            
            <div class="field required">
                <label>Data creazione</label>
                <input type="text" placeholder="Descrizione" readonly="true" :value="course.dataCreazione | formatDate">
            </div>            
            <div class="field">
                <div class="ui toggle checkbox">
                    <input type="checkbox" v-model="course.abilitato">
                    <label>Abilitato</label>
                </div>
            </div>
            <button type="button" class="ui primary button" @click="save">Salva</button>
            <button type="button" class="ui button" @click="cancel">Annulla</button>
        </form>
        <div class="ui error message center aligned" v-if="error">{{ errorMessage }}</div>
    </div>
</template>

<script>
import moment from 'moment'

export default {
    name: 'Course',
    data: () => ({
        loading: true,
        pageName: 'Nuovo',
        error: false,
        errorMessage : '',
        courseid: null,
        course: {}
    }),
    created() {
        this.loading = true;        
        this.courseid = this.$route.params.courseid;

        if(this.courseid!=null) {
            this.pageName = 'Modifica';

            let headers = new Headers();
            if(this.$store.state.userToken!=null) {
                headers.append("Authorization", "Bearer "+this.$store.state.userToken);
            }

            let initParams = { 
                headers: headers,
                mode: 'cors',
                cache: 'default'
            };

            fetch('http://localhost:8080/Corsi-VVF-web/api/courses/'+this.courseid, initParams)
            .then(response => {
                if(!response.ok) {
                    throw Error(response.status);
                }
                return response;
            })
            .then(response => response.json())
            .then(jsonResp => {
                console.log(jsonResp); 
                this.course = jsonResp;
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
        }
        else {
            this.course.dataCreazione = moment().format();
            this.course.dataAggiornamento = this.course.dataCreazione;
            this.course.titolo = null;
            this.course.descrizione = null;
            this.course.abilitato = true;
        }
    },
    methods: {
        save() {
            this.error = false;
            this.errorMessage = '';
            console.log("SAVING COURSE...");

            this.course.titolo = this.course.titolo.toUpperCase();

            let headers = new Headers();
            if(this.$store.state.userToken!=null) {
                headers.append("Authorization", "Bearer "+this.$store.state.userToken);
                headers.append("Content-Type", "application/json");
            }

            let initParams = { 
                method: (this.courseid!=null) ? 'PUT' : 'POST',
                headers: headers,
                mode: 'cors',
                cache: 'default',
                body: JSON.stringify(this.course)
            };

            let path = 'http://localhost:8080/Corsi-VVF-web/api/courses';
            if(this.courseid!=null) {
                path=path+'/'+this.courseid;
            }

            fetch(path, initParams)
            .then(response => {
                if(!response.ok) {
                    throw Error(response.status);
                }
                return response;
            })
            .then(response => {
                console.log("COURSE UPDATE STATUS = "+response.status);
                if(response.status==204 || response.status==201) {
                    this.$router.push({name: 'home'});
                }
            })
            .catch(error => {
                this.error = true;
                console.log("ERROR: "+error.message);
                switch(error.message) {
                    case '401': {
                        console.log("Going to home...");
                        this.$router.push('/');
                        break;
                    }
                    case '409': {
                        console.log("duplicato!");
                        this.errorMessage = 'Il corso esiste già.';
                        break;
                    }
                    default: {
                        this.error = true;
                    }
                }
            });
        },
        cancel() {
            this.$router.push({name: 'home'});
        }
    }
}
</script>