(function registerJourneySimulationModule(){
    "use strict";
    const app=window.Alekrythae;if(!app)throw new Error("Alekrythae orkestratörü bulunamadı");
    app.registerModule({
        id:"journey.simulation",order:30,
        async start({eventBus}){
            const engine=window.__ALEK_JOURNEY_SIMULATION__;if(!engine)throw new Error("Journey zaman motoru köprüsü bulunamadı");
            this.engine=engine;app.journeySimulation=engine;eventBus.emit("journey:simulation-ready",{progression:"action-driven",precision:"seconds"});
        },
        async stop(){if(app.journeySimulation===this.engine)delete app.journeySimulation;this.engine=null;}
    });
})();
