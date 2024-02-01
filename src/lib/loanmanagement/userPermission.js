import ENV from '../../config/env';
import util from './utility';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
// import initializeStore from '../store/index';
// const user = initializeStore().getState().user;
// Create an encryptor:
// @ts-ignore
const encryptor = require('simple-encryptor')(ENV.ENCRYPTION_KEY);

export const isUserHasPermission = (functionality, accessRight) => {
	let isPermitted = false;

	// const permissionList = user.permissionList;
	if (sessionStorage.getItem('userPermissions') != null) {
		const decrypted = encryptor.decrypt(sessionStorage.getItem('userPermissions'));
		const sessionPermissionList = decrypted;//JSON.parse(sessionStorage.getItem('userPermissions'));

		if (Array.isArray(accessRight)) {
			// access right array
			const selectedPermission = sessionPermissionList.find(element => (element.functionality == functionality && accessRight.includes(element.accessRight)));
			if (selectedPermission) {
				isPermitted = selectedPermission.permission;
			}

		} else {
			// single access right
			const selectedPermission = sessionPermissionList.find(element => (element.functionality == functionality && element.accessRight == accessRight));
			if (selectedPermission) {
				isPermitted = selectedPermission.permission;
			}
		}
	}
	return isPermitted;
};


const checkRoutePermission = (routes, permissions) => {

	const permittedRotues = [];

	for (const route of routes) {
		if (!util.isNullOrEmpty(route.permission)) {
			const selectedPermission = permissions.find(permission => (permission.functionality === route.permission && permission.accessRight === 'View'));
			if (util.isNullOrEmpty(selectedPermission)) continue;
			if (!selectedPermission.permission) continue;
		}
		if (route.children) {
			route.children = checkRoutePermission(route.children, permissions);
		}
		permittedRotues.push(route);
	}
	return permittedRotues;
};

export const filterPermittedRoutes = (routes) => {

	let filterdRoutes = [];
	if (sessionStorage.getItem('userPermissions') != null) {
		const decrypted = encryptor.decrypt(sessionStorage.getItem('userPermissions'));
		const sessionPermissionList = decrypted;

		filterdRoutes = filterdRoutes.concat(checkRoutePermission(routes, sessionPermissionList));
	}

	return filterdRoutes;
};

export const rembemberMe = (data) => {
	const encrypted = encryptor.encrypt(data);
	if (localStorage.getItem('rememberMeDetails') != null) {
		// remove exsistance Data
		localStorage.removeItem("rememberMeDetails");
	}
	localStorage.rememberMeDetails = encrypted;

	return true;

};

export const decriptRembemberMe = () => {
	let response = {};
	if (localStorage.getItem('rememberMeDetails') != null) {
		// rememberMe available
		const decrypted = encryptor.decrypt(localStorage.getItem('rememberMeDetails'));
		response = decrypted;
	}

	return response;

};


export const decriptedRoutes = () => {

	let decriptedRoutes = [];
	if (sessionStorage.getItem('routes') != null) {
		const decrypted = encryptor.decrypt(sessionStorage.getItem('routes'));
		const routes = decrypted;

		decriptedRoutes = routes;
	}

	return decriptedRoutes;


};

export const getLogedInUseRole = () => {

	if (sessionStorage.getItem('userPermissions') != null) {
		const decrypted = encryptor.decrypt(sessionStorage.getItem('userPermissions'));
		const avilableUserRoles = decrypted;//JSON.parse(sessionStorage.getItem('userPermissions'));
		const userObject  = avilableUserRoles && avilableUserRoles.lenght === 0 ? '' : avilableUserRoles[0];
        const userRole = userObject.role;
		return userRole;
	}
	
};