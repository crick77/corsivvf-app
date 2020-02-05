<template>
    <div class="ui container">
        <h2>Documenti {{ sourceType }} {{ sourceTitle }}</h2>
        <table class="ui celled table">
            <thead>
                <th>Nome file</th>
                <th>Dimensione</th>
                <th>Checksum</th>
                <th width="8%" class="center aligned"><i class="icon cogs" title="Azioni"/></th>
            </thead>
            <tbody v-if="!loading">
                <tr v-for="doc in documents" :key="doc.id">
                    <td>{{ doc.nomefile }}</td>
                    <td>{{ doc.dimensione | formatBytes }}bytes</td>
                    <td>{{ checksumFormat(doc.checksum) }}</td>
                    <td class="center aligned">                        
                        <i class="icon download pointer" title="Download" @click="download(doc.id)"/>                        
                        <i class="icon eraser pointer" title="Elimina" @click="remove(doc.id, doc.nomefile)"/>                                                
                    </td>
                </tr>
                <tr v-if="documents.length == 0">
                    <td colspan="4" class="center aligned">Nessun documento in archivio.</td>
                </tr>
            </tbody>
            <tbody v-if="loading">
                <tr>
                    <td colspan="4" class="center aligned">
                        <img src='../assets/spinning.gif' />
                    </td>
                </tr>
            </tbody>
            <tfoot v-if="(documents.length != 0) && (!loading)">
                <th colspan="3">{{ documents.length }} documenti in archivio.</th>
                <th class="center aligned"><i class="icon refresh pointer" title="Aggiorna" @click="refresh" /></th>
            </tfoot>        
        </table>
        <button type="button" class="ui positive button" @click="backToCourses">Torna ai corsi</button>
        <button type="button" class="ui primary button" @click="addNew">Nuovo documento</button>
        <div class="ui error message" v-if="error">{{ errorMessage }}</div>
    </div>
</template>

<script>
export default {
    name: 'Docs',
    data: () => ({
        loading: true,
        error: false,
        errorMessage: '',
        courseId: null,
        categoryId: null,
        sourceTitle: null,
        documents: []
    }),
    created() {
        let pids = String(this.$route.params.parentids);
        let subids = pids.split(":")
        this.courseId = Number(subids[0]);
        if(subids.length==2) {
            this.categoryId = Number(subids[1]);
        }
        this.documents = [];

        let headers = new Headers();
        if(this.$store.state.userToken!=null) {
            headers.append("Authorization", "Bearer "+this.$store.state.userToken);
        }

        let initParams = { 
            headers: headers,
            mode: 'cors',
            cache: 'default'
        };

        let fetchurl = 'http://localhost:8080/Corsi-VVF-web/api/courses/'+this.courseId;
        if(this.categoryId) {
            fetchurl=fetchurl+'/categories/'+this.categoryId;
        }        

        fetch(fetchurl, initParams)
            .then(response => {
                if(!response.ok) {
                    throw Error(response.status);
                }
                return response;
            })
            .then(response => response.json())
            .then(jsonResp => {
                console.log(jsonResp); 
                this.sourceTitle = (this.categoryId) ? jsonResp.nome : jsonResp.titolo;
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
                        if(!error.response) {
                            this.errorMessage = 'Comunicazione con il server fallita.';
                        }
                        else {
                            this.errorMessage = "Errore sconosciuto contattare il supporto ("+error.message+").";
                        }
                    }
                }

                return;
            });

        this.refresh();
    },
    computed: {
        sourceType: function() {
            return (this.categoryId) ? 'della categoria' : "del corso";
        }
    },
    methods: {
        checksumFormat(value) {
            let s = String(value).split(":");
            return s[1]+' ['+s[0]+']';            
        },
        backToCourses() {
            this.$router.push({name: 'home'});
        },
        refresh() {
            this.loading = true;
            this.error = false;
            this.documents = [];

            let headers = new Headers();
            if(this.$store.state.userToken!=null) {
                headers.append("Authorization", "Bearer "+this.$store.state.userToken);
            }

            let initParams = { 
                headers: headers,
                mode: 'cors',
                cache: 'default'
            };

            let fetchurl = 'http://localhost:8080/Corsi-VVF-web/api/courses/'+this.courseId;
            if(this.categoryId) {
                fetchurl=fetchurl+'/categories/'+this.categoryId;
            } 
            fetchurl=fetchurl+'/documents';

            fetch(fetchurl, initParams)
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
                    .then(item => this.documents.push(item));      
                })
            })
            .then(() => {
                window.setTimeout(() => {
                    console.log("FINISHED!!");
                    this.loading = false;
                }, 2000);
            })
            .catch(error => {
                this.loading = false;
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
                        if(!error.response) {
                            this.errorMessage = 'Comunicazione con il server fallita.';
                        }
                        else {
                            this.errorMessage = "Errore sconosciuto contattare il supporto ("+error.message+").";
                        }
                    }
                }
            });
        },
        download(docId) {
            this.error = false;
            this.errorMessage = null;

            let headers = new Headers();
            if(this.$store.state.userToken!=null) {
                headers.append("Authorization", "Bearer "+this.$store.state.userToken);
                headers.append("Accept", "application/octet-stream");
            }

            let initParams = { 
                headers: headers,
                responseType: 'arraybuffer',
                mode: 'cors',
                cache: 'default'
            };

            let filename = null;
            let contentType = null;

            let fetchurl = 'http://localhost:8080/Corsi-VVF-web/api/courses/'+this.courseId;
            if(this.categoryId) {
                fetchurl=fetchurl+'/categories/'+this.categoryId;
            } 
            fetchurl=fetchurl+'/documents/'+docId+'/stream';

            fetch(fetchurl, initParams)
            .then(response => {
                console.log("Response ok? "+response.ok);
                if(!response.ok) {
                    throw Error(response.status)
                }
                return response;
            })
            .then(response => {
                response.headers.forEach(function(val, key) { console.log(key + ' -> ' + val); });                
                filename = response.headers.get('content-disposition').split('=')[1].replace(/^"+|"+$/g, '');
                contentType = response.headers.get('content-type');
                console.log("Filename: "+filename);
                console.log("Content-type: "+contentType);
                return response;
            })
            .then(response => response.blob())
            .then(blob => {
                let url = window.URL.createObjectURL(new Blob([blob], {type: contentType}));
                let link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                link.click();
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
                        if(!error.response) {
                            this.errorMessage = 'Comunicazione con il server fallita.';
                        }
                        else {
                            this.errorMessage = "Errore sconosciuto contattare il supporto ("+error.message+").";
                        }
                    }
                }
            });
        },
        remove(docId, filename) {
            this.error = false;
            this.errorMessage = null;

            if(!window.confirm("Eliminare il documento "+filename+"?")) return;

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

            let fetchurl = 'http://localhost:8080/Corsi-VVF-web/api/courses/'+this.courseId;
            if(this.categoryId) {
                fetchurl=fetchurl+'/categories/'+this.categoryId;
            } 
            fetchurl=fetchurl+'/documents/'+docId;

            fetch(fetchurl, initParams)
            .then(response => {
                if(!response.ok) {
                    throw Error(response.status);
                }
                return response;
            })
            .then(response => {
                if(response.status==204 || response.status==200) {                           
                    this.refresh();
                }                            
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
                        if(!error.response) {
                            this.errorMessage = 'Comunicazione con il server fallita.';
                        }
                        else {
                            this.errorMessage = "Errore sconosciuto contattare il supporto ("+error.message+").";
                        }
                    }
                }
            });
        },
        addNew() {
            let ids = String(this.courseId);
            if(this.categoryId) {
                ids=ids+':'+String(this.categoryId);
            }
            this.$router.push({name: 'doc', params:{ parentids: ids }});
        }
    }
}
</script>