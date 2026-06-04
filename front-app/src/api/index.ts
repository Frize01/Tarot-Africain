import appMethods from '@/api/appApi';
import tarotMethods from '@/modules/tarot_africain/api';
// import pokerMethods from '@/modules/poker/api';

const apiMethods = {
    ...appMethods,
    ...tarotMethods,
    // ...pokerMethods
};

export default apiMethods;
