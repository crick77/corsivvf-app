<template>
    <div class="ui container">
        <form class="ui form">
            <h4 class="ui dividing header">Modifica corso</h4>
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
            <button class="ui primary button" v-on:click="save">Salva</button>
            <button class="ui button" v-on:click="cancel">Annulla</button>
        </form>
        <div class="ui error message center aligned" v-if="error">{{ errorMessage }}</div>
    </div>
</template>

<script>
export default {
    name: 'Course',
    data: () => ({
        loading: true,
        error: false,
        errorMessage : '',
        courseid: null,
        course: {}
    }),
    created() {
        this.loading = true;        
        this.courseid = this.$route.params.courseid;

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
    },
    methods: {
        save() {
            this.error = false;
            this.errorMessage = '';
            console.log("SAVING COURSE...");

            let headers = new Headers();
            if(this.$store.state.userToken!=null) {
                headers.append("Authorization", "Bearer "+this.$store.state.userToken);
                headers.append("Content-Type", "application/json");
            }

            let initParams = { 
                method: 'PUT',
                headers: headers,
                mode: 'cors',
                cache: 'default',
                body: JSON.stringify(this.course)
            };

            fetch('http://localhost:8080/Corsi-VVF-web/api/courses/'+this.courseid, initParams)
            .then(response => {
                if(!response.ok) {
                    throw Error(response.status);
                }
                return response;
            })
            .then(response => {
                console.log("COURSE UPDATE STATUS = "+response.status);
                if(response.status==204) {
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