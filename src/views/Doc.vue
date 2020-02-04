<template>
    <div class="ui container">
        <form class="ui form" @submit.prevent="onSubmit">
            <h4 class="ui dividing header">Carica documento</h4>
            <div class="field required" :class="documentError">
                <label>File</label>
                <input type="file" placeholder="Documento" id="document" @change="selectedFile($event)"/>
            </div>            
            <button type="button" class="ui primary button" @click="save">Salva</button>
            <button type="button" class="ui button" @click="cancel">Annulla</button>
        </form>
        <div class="ui error message center aligned" v-if="error">{{ errorMessage }}</div>
    </div>
</template>

<script>
export default {
    name:'Doc',
    data: () => ({
        courseId: null,
        categoryId: null,
        error: false,
        errorMessage: null,
        documentError: null,
        docFile: null
    }),
    created() {
        let pids = String(this.$route.params.parentids);
        let subids = pids.split(":")
        this.courseId = Number(subids[0]);
        if(subids.length==2) {
            this.categoryId = Number(subids[1]);
        }
    },
    methods: {
        selectedFile(event) {
            console.log(event);
            this.docFile = event.target.files[0];
        },
        save() {
            this.error = false;
            this.documentError = null;

            if(!this.docFile) {
                this.documentError = 'error';
                return;
            }

            let formData = new FormData();
            formData.append('document', this.docFile);

            let headers = new Headers();
            if(this.$store.state.userToken!=null) {
                headers.append("Authorization", "Bearer "+this.$store.state.userToken);
            }

            let initParams = { 
                method: 'POST',
                headers: headers,
                mode: 'cors',
                cache: 'default',
                body: formData
            };

            let posturl = 'http://localhost:8080/Corsi-VVF-web/api/courses/'+this.courseId;
            if(this.categoryId) {
                posturl=posturl+'/categories/'+this.categoryId;
            }
            posturl=posturl+'/documents';

            fetch(posturl, initParams)
            .then(response => {
                if(!response.ok) {
                    throw Error(response.status);
                }
                return response;
            })
            .then(response => {
                console.log("DOC UPLOAD STATUS = "+response.status);                
                this.$router.back();                
            })
            .catch(error => {
                console.log("ERROR: "+error.message);
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
        cancel() {
            this.$router.back();
        }
    }
}
</script>