export default {
    map : {
        selector : '#map',
        width : 240, height : 240,
        color : '#fafafa'
    },
    food : {
        width : 10, height : 10,
        color : '#da4444'
    },
    snake : {
        parts : 4,
        width : 10, height : 10,
        headColor : '#459045',
        bodyColor : '#43c643'
    },
    joystick : {
        direction : 'right',
        leftSelector : '#left',
        rightSelector: '#right',
        upSelector : '#up',
        downSelector : '#down'
    },
    game : {
        fps : 0,
        speed : 85,
        reward : 100,
        scoreSelector : '#score'
    }
};
