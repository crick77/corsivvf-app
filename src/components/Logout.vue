<template>
    <div v-if='isLogged'>
        <div class="ui vertical animated button negative" tabindex="0" @click="logout">
            <div class="hidden content">Logout</div>
            <div class="visible content">
                <i class="sign-out icon"></i>
            </div>
        </div>
        <div v-if="error" class='error'>{{ errorMessage }}</div>        
    </div>
</template>

<script>
export default {
    name: 'Logout',
    data: function() {
        return {
            error: false,
            errorMessage: ''
        }
    },
    methods: {        
        isLogged: function() {
            return this.$store.getters.isLogged();
        },
        logout: function() {
            if(!window.confirm("Sicuri di voler uscire?")) return;

            this.error = false;

            let headers = new Headers();
            if(this.$store.state.userToken!=null) {
                headers.append("Authorization", "Bearer "+this.$store.state.userToken);
            }

            let initParams = { 
                method: 'POST',
                headers: headers,
                mode: 'cors',
                cache: 'default',
                body: JSON.stringify(this.course)
            };

            let path = 'http://localhost:8080/Corsi-VVF-web/api/auth/logout';
            fetch(path, initParams)
            .then(response => {
                if(!response.ok) {
                    throw Error(response.status);
                }
                console.log("Logged out correctly...going home");
                this.$store.commit('setUserToken', null);
                this.$router.push("/");                
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
                        console.log("Already logged out...going home...");
                        this.$router.push("/"); 
                        break;               
                    }
                    default: {
                        this.error = true;
                        this.errorMessage = error.message;
                    }
                }                
            });
        }
    }
}
</script>