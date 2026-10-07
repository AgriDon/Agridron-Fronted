import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { Farm } from '../domain/model/farm.entity.js';
import { Parcel } from '../domain/model/parcel.entity.js';
import { FumigationArea } from '../domain/model/fumigationArea.entity.js';
import { Crop } from '../domain/model/crop.entity.js';
import { User } from '../domain/model/user.entity.js';
import { FarmApiEndpoint } from './farm-api-endpoint.js';
import { ParcelApiEndpoint } from './parcel-api-endpoint.js';
import { FumigationAreaApiEndpoint } from './fumigation-area-api-endpoint.js';
import { CropApiEndpoint } from './crop-api-endpoint.js';
import { UserApiEndpoint } from './user-api-endpoint.js';

/**
 * Infrastructure facade for farm, parcel, fumigation area and crop endpoint operations.
 */
export class FieldManagementApi extends BaseApi {

    /** @type {FarmApiEndpoint} */
    #farmEndpoint;

    /** @type {ParcelApiEndpoint} */
    #parcelEndpoint;

    /** @type {FumigationAreaApiEndpoint} */
    #fumigationAreaEndpoint;

    /** @type {CropApiEndpoint} */
    #cropEndpoint;

    /** @type {UserApiEndpoint} */
    #userEndpoint;

    constructor() {
        super();

        const http = this.http;

        this.#farmEndpoint = new FarmApiEndpoint(http);
        this.#parcelEndpoint = new ParcelApiEndpoint(http);
        this.#fumigationAreaEndpoint = new FumigationAreaApiEndpoint(http);
        this.#cropEndpoint = new CropApiEndpoint(http);
        this.#userEndpoint = new UserApiEndpoint(http);
    }

    /**
     * Retrieves all farms.
     * @returns {Promise<Farm[]>} Promise with the farm collection.
     */
    getAllFarms = () => this.#farmEndpoint.getAll();

    /**
     * Retrieves a single farm by ID.
     * @param {number|string} id - The ID of the farm.
     * @returns {Promise<Farm>} Promise with the farm.
     */
    getFarmById = (id) => this.#farmEndpoint.getById(id);

    /**
     * Creates a new farm.
     * @param {Farm} farm - The farm to create.
     * @returns {Promise<Farm>} Promise with the created farm.
     */
    createFarm = (farm) => this.#farmEndpoint.create(farm);

    /**
     * Updates an existing farm.
     * @param {Farm} farm - The farm to update.
     * @returns {Promise<Farm>} Promise with the updated farm.
     */
    updateFarm = (farm) => this.#farmEndpoint.update(farm, farm.id);

    /**
     * Deletes a farm by ID.
     * @param {number|string} id - The ID of the farm to delete.
     * @returns {Promise<void>} Promise for the delete operation.
     */
    deleteFarm = (id) => this.#farmEndpoint.delete(id);

    /**
     * Retrieves all parcels.
     * @returns {Promise<Parcel[]>} Promise with the parcel collection.
     */
    getAllParcels = () => this.#parcelEndpoint.getAll();

    /**
     * Retrieves a single parcel by ID.
     * @param {number|string} id - The ID of the parcel.
     * @returns {Promise<Parcel>} Promise with the parcel.
     */
    getParcelById = (id) => this.#parcelEndpoint.getById(id);

    /**
     * Creates a new parcel.
     * @param {Parcel} parcel - The parcel to create.
     * @returns {Promise<Parcel>} Promise with the created parcel.
     */
    createParcel = (parcel) => this.#parcelEndpoint.create(parcel);

    /**
     * Updates an existing parcel.
     * @param {Parcel} parcel - The parcel to update.
     * @returns {Promise<Parcel>} Promise with the updated parcel.
     */
    updateParcel = (parcel) => this.#parcelEndpoint.update(parcel, parcel.id);

    /**
     * Deletes a parcel by ID.
     * @param {number|string} id - The ID of the parcel to delete.
     * @returns {Promise<void>} Promise for the delete operation.
     */
    deleteParcel = (id) => this.#parcelEndpoint.delete(id);

    /**
     * Retrieves all fumigation areas.
     * @returns {Promise<FumigationArea[]>} Promise with the fumigation area collection.
     */
    getAllFumigationAreas = () => this.#fumigationAreaEndpoint.getAll();

    /**
     * Retrieves a single fumigation area by ID.
     * @param {number|string} id - The ID of the fumigation area.
     * @returns {Promise<FumigationArea>} Promise with the fumigation area.
     */
    getFumigationAreaById = (id) => this.#fumigationAreaEndpoint.getById(id);

    /**
     * Creates a new fumigation area.
     * @param {FumigationArea} fumigationArea - The fumigation area to create.
     * @returns {Promise<FumigationArea>} Promise with the created fumigation area.
     */
    createFumigationArea = (fumigationArea) => this.#fumigationAreaEndpoint.create(fumigationArea);

    /**
     * Updates an existing fumigation area.
     * @param {FumigationArea} fumigationArea - The fumigation area to update.
     * @returns {Promise<FumigationArea>} Promise with the updated fumigation area.
     */
    updateFumigationArea = (fumigationArea) => this.#fumigationAreaEndpoint.update(fumigationArea, fumigationArea.id);

    /**
     * Deletes a fumigation area by ID.
     * @param {number|string} id - The ID of the fumigation area to delete.
     * @returns {Promise<void>} Promise for the delete operation.
     */
    deleteFumigationArea = (id) => this.#fumigationAreaEndpoint.delete(id);

    /**
     * Retrieves all crops.
     * @returns {Promise<Crop[]>} Promise with the crop collection.
     */
    getAllCrops = () => this.#cropEndpoint.getAll();

    /**
     * Retrieves a single crop by ID.
     * @param {number|string} id - The ID of the crop.
     * @returns {Promise<Crop>} Promise with the crop.
     */
    getCropById = (id) => this.#cropEndpoint.getById(id);

    /**
     * Creates a new crop.
     * @param {Crop} crop - The crop to create.
     * @returns {Promise<Crop>} Promise with the created crop.
     */
    createCrop = (crop) => this.#cropEndpoint.create(crop);

    /**
     * Updates an existing crop.
     * @param {Crop} crop - The crop to update.
     * @returns {Promise<Crop>} Promise with the updated crop.
     */
    updateCrop = (crop) => this.#cropEndpoint.update(crop, crop.id);

    /**
     * Deletes a crop by ID.
     * @param {number|string} id - The ID of the crop to delete.
     * @returns {Promise<void>} Promise for the delete operation.
     */
    deleteCrop = (id) => this.#cropEndpoint.delete(id);

    /**
     * Retrieves all users.
     *
     * The password field is dropped by the assembler and never reaches the client.
     *
     * @returns {Promise<User[]>} Promise with the user collection.
     */
    getAllUsers = () => this.#userEndpoint.getAll();
}