<template>
    <div class="ui middle aligned center aligned grid center-screen">
        <div class="column">
            <h2 class="ui teal image header">
                <div class="content">
                    Per favore, autenticati
                </div>
            </h2>
            <form class="ui large form" @submit.prevent="onSubmit" :class="{ error }">
                <div class="ui stacked segment">
                    <div class="field" :class="usernameError">
                        <div class="ui left icon input">
                            <i class="user icon"></i>
                            <input type="text" v-model="username" name="username" placeholder="Username">
                        </div>
                    </div>
                    <div class="field" :class="passwordError">
                        <div class="ui left icon input">
                            <i class="lock icon"></i>
                            <input type="password" v-model="password" name="password" placeholder="Password">
                        </div>
                    </div>
                    <button type="submit" class="ui fluid large teal submit button">Login</button>
                </div>

                <div class="ui error message">{{ errorMessage }}</div>

            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Login',
    data: () => ({
        username: null,
        password: null,
        usernameError: null,
        passwordError: null,
        error: false,
        errorMessage : ''
    }),
    methods: {
        onSubmit() {
            this.error = false;
            this.usernameError = this.passwordError = null;
            this.errorMessage = '';

            if(!this.username) {
                this.usernameError = 'error';
            }
            if(!this.password) {
                this.passwordError = 'error';
            }

            if(this.usernameError || this.passwordError) return;

            let loginBody = JSON.stringify({
                'username': this.username,
                'password': this.password
            });

            let headers = new Headers();
            headers.append("Content-Type", "application/json");
            
            let initParams = { 
                method: 'POST',
                headers: headers,
                mode: 'cors',
                cache: 'default',
                body: loginBody 
            };        

            fetch('http://localhost:8080/Corsi-VVF-web/api/auth/login', initParams)
            .then(response => {
                if(!response.ok) {
                    throw Error(response.status);
                }
                return response;
            })
            .then(response => response.text())
            .then(textResp => {
                this.$store.commit('setUserToken', textResp);
                console.log(this.$store.state.userToken);
                this.$router.push('/home');            
            })
            .catch(error => {
                this.$store.commit('setUserToken', null);
                switch(error.message) {
                    case '401': {
                        this.error = true;
                        this.errorMessage = "User/password errate o applicazione non autorizzata.";
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
    },
};
</script>

<style>
    body {
      background-color: #DADADA;
    }
    body > .grid {
      height: 100%;
    }
    .image {
      margin-top: -100px;
    }
    .column {
      max-width: 450px;
    }
    .center-screen {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        min-height: 95vh;
    }
</style>