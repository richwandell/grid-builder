import $ from 'jquery';

class State {

    constructor(container){
        this.container = container;
    }

    getId(){
        return $("#builder_select_existing").val()
    }

    getState(){
        return {
            "floorplanname": $("#builder_floorplan_name").val(),
            "grid": this.container.grid.getFullGrid(),
            "grid_color": this.container.grid.getGridColor(),
            "hgrid_spaces": this.container.grid.getHGridSpaces(),
            "vgrid_spaces": this.container.grid.getVGridSpaces(),
            "id": this.getId(),
            "image": this.container.grid.getImageString(),
            "name": this.container.grid.getImageName(),
            "rotation": this.container.compass.getRotation(),
            "ignore": this.container.grid.getIgnoreSelected()
        };
    }
}

export default State;