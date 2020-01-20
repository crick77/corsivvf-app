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
                    <div class="field">
                    <div class="ui left icon input">
                        <i class="user icon"></i>
                        <input type="text" v-model="username" name="username" placeholder="Username">
                    </div>
                    </div>
                    <div class="field">
                    <div class="ui left icon input">
                        <i class="lock icon"></i>
                        <input type="password" v-model="password" name="password" placeholder="Password">
                    </div>
                    </div>
                    <button type="submit" class="ui fluid large teal submit button">Login</button>
                </div>

                <div class="ui error message">Errore nel login</div>

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
        error: false
    }),
    methods: {
        onSubmit() {
            this.error = false;

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
                switch(response.status) {
                    case 200: {
                        response.text().then(textResp => {
                            this.$store.commit('setUserToken', textResp);
                            console.log(this.$store.state.userToken);
                            this.$router.push('/home');
                        });
                        break;
                    }
                    case 401: {
                        this.$store.commit('setUserToken', null);
                        this.error = true;
                    }
                }
            })
            .catch(() => {
                this.$store.commit('setUserToken', null);
                this.error = true;
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