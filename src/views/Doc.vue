<template>
    <div class="ui container">
        <form class="ui form" @submit.prevent="onSubmit">
            <h4 class="ui dividing header">Carica documento</h4>
            <div class="field required">
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
            let formData = new FormData();
            formData.append('document', this.docFile);

            let headers = new Headers();
            if(this.$store.state.userToken!=null) {
                headers.append("Authorization", "Bearer "+this.$store.state.userToken);
                //headers.append("Content-Type", "multipart/form-data");
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
                if(response.status==200 || response.status==204 || response.status==201) {
                    this.$router.back();
                }
            })
            .catch(error => {
                this.error = true;
                console.log("ERROR: "+error.message);
                switch(String(error.message)) {
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
            this.$router.back();
        }
    }

}
</script>