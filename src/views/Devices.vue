<template>
    <div class="ui container">
        <h2>Dispositivi</h2>
        <div class="ui form">
            <div class="inline fields">
                <div class="field">
                    <label>Mostra</label>
                    <select class="ui search dropdown" v-model="devid">
                        <option value="devid@123456789">Samsung S5e [355049/10/240536/0]</option>
                        <option value="devid@987654321">Samsung S5e [355049/10/240536/1]</option>
                        <option value="devid@000000000">Samsung S5e [355049/10/240536/2 NON ABILITATO]</option>
                        <option value="inesistente">Samsung S5e [NON CENSITO]</option>
                        <option value="">Samsung S5e [NON CORRETTO]</option>
                    </select>
                </div>
                <div class="field">
                    <button @click="enableDevice" class="ui yellow button">Abilita</button>
                    <button @click="backToCourse" class="ui pink button">Torna ai corsi</button>
                </div>
            </div>        
        </div>
        <div class="ui positive message" v-if="assignedToken">
            <i class="close icon"></i>
            <div class="header">Dispositivo abilitato!</div>
            <p>Token assegnato <b>{{ assignedToken }}</b>.</p>
        </div>
        <div class="ui error message center aligned" v-if="error">{{ errorMessage }}</div>
    </div>
</template>

<script>
export default {
    name: 'Devices',
    data: () => ({
        devid: null,
        error: false,
        errorMessage: '',
        assignedToken: null
    }),
    methods: {
        enableDevice() {
            this.error = false;
            this.assignedToken = null;

            let headers = new Headers();
            if(this.devid) {
                headers.append("Device-Id", this.devid);            
            }

            let initParams = {
                method: 'POST', 
                headers: headers,
                mode: 'cors',
                cache: 'default'
            };

            fetch('http://localhost:8080/Corsi-VVF-web/api/devices', initParams)
            .then(response => {
                if(!response.ok) {
                    throw Error(response.status);
                }
                return response;
            })
            .then(response => response.text())
            .then(response => {
                this.assignedToken = response;
            })
            .catch(error => {                
                console.log("ERROR: "+error.message);
                if(!error.response) {
                    this.error = true;
                    this.errorMessage = 'Comunicazione con il server fallita.';
                    return;
                }
                switch(error.message) {
                    case '304': {
                        this.error = true;
                        this.errorMessage = "Il device è già abilitato.";
                        break;
                    }
                    case '400': {
                        this.error = true;
                        this.errorMessage = "Richiesta non inviata correttamente.";
                        break;
                    }
                    case '401': {
                        this.error = true;
                        this.errorMessage = "Il device non è autorizzato a comunicare.";
                        break;
                    }                                        
                    case '404': {
                        this.error = true;
                        this.errorMessage = "Device non trovato!";
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
        backToCourse() {
            this.$router.push({name: 'home'});
        }
    }
}
</script>