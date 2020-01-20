import Vue from "vue";
import Router from "vue-router";
import Login from "./views/Login.vue";
import Home from './views/Home.vue';
import store from './store';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: "/",
            name: "login",
            component: Login
        },
        {
            path: "/home",
            name: "home",
            component: Home,
            beforeEnter(to, from, next) {
                console.log("Here!!! ["+from.name+"->"+to.name);
                console.log("State = ["+JSON.stringify(store.state)+"]");
                if(store.state.userToken==null) {
                    if(from.name=='login') {
                        console.log("Siamo in login...non andare verso: "+to.name);
                        next(false);
                    } 
                    else {
                        console.log("Vai alla login!");
                        next({
                            name: 'login',
                            query: { redirect: to.fullPath }
                          })
                    }
                }
                else {
                    console.log("Login ok!! Vieni da "+from.name+" -> "+to.name);
                    next();
                }
            }
        }
    ]
});
