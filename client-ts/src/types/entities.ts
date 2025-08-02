/**
 * Entity Types and Interfaces
 * Defines the structure of all entities in the system
 */

// Base Entity Interface
export interface BaseEntity {
  readonly id: number;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  isActive: boolean;
}

// Municipality Interface
export interface Municipality extends BaseEntity {
  name: string;
  code: string;
  sectorsCount?: number;
  sectors?: Sector[];
}

// Create Municipality DTO
export interface CreateMunicipalityDto {
  name: string;
  code: string;
  isActive?: boolean;
}

// Update Municipality DTO
export interface UpdateMunicipalityDto extends Partial<CreateMunicipalityDto> {
  id: number;
}

// Sector Interface
export interface Sector extends BaseEntity {
  name: string;
  code: string;
  municipalityId: number;
  municipality?: Municipality;
  municipalityName?: string;
  municipalityCode?: string;
  complaintsCount?: number;
  complaints?: Complaint[];
}

// Create Sector DTO
export interface CreateSectorDto {
  name: string;
  code: string;
  municipalityId: number;
  isActive?: boolean;
}

// Update Sector DTO
export interface UpdateSectorDto extends Partial<CreateSectorDto> {
  id: number;
}

// Complaint Type Interface
export interface ComplaintType extends BaseEntity {
  name: string;
  description?: string;
  complaintsCount?: number;
  complaints?: Complaint[];
}

// Create Complaint Type DTO
export interface CreateComplaintTypeDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

// Update Complaint Type DTO
export interface UpdateComplaintTypeDto extends Partial<CreateComplaintTypeDto> {
  id: number;
}

// Status Interface
export interface Status extends BaseEntity {
  name: string;
  description?: string;
  color: string;
  complaintsCount?: number;
  complaints?: Complaint[];
}

// Create Status DTO
export interface CreateStatusDto {
  name: string;
  description?: string;
  color: string;
  isActive?: boolean;
}

// Update Status DTO
export interface UpdateStatusDto extends Partial<CreateStatusDto> {
  id: number;
}

// User Interface
export interface User extends BaseEntity {
  fullName: string;
  nickName: string;
  email: string;
  picture?: string;
  roles?: string[];
  complaintsCount?: number;
  votesCount?: number;
  commentsCount?: number;
}

// Auth User Interface (for authentication)
export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  roles: string[];
  isActive: boolean;
}

// Login DTO
export interface LoginDto {
  email: string;
  password: string;
}

// Register DTO
export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: string;
}

// Auth Response DTO
export interface AuthResponseDto {
  token: string;
  expires: Date;
  user: AuthUser;
}

// Change Password DTO
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Priority Enum
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Complaint Interface
export interface Complaint extends BaseEntity {
  title: string;
  description: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  priority: Priority;
  complaintTypeId: number;
  complaintType?: ComplaintType;
  complaintTypeName?: string;
  statusId: number;
  status?: Status;
  statusName?: string;
  statusColor?: string;
  municipalityId: number;
  municipality?: Municipality;
  municipalityName?: string;
  sectorId?: number;
  sector?: Sector;
  sectorName?: string;
  userId?: number;
  user?: User;
  userFullName?: string;
  attachments?: Attachment[];
  comments?: Comment[];
  votes?: Vote[];
  votesCount?: number;
  commentsCount?: number;
  history?: ComplaintHistory[];
}

// Create Complaint DTO
export interface CreateComplaintDto {
  title: string;
  description: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  priority?: Priority;
  complaintTypeId: number;
  municipalityId: number;
  sectorId?: number;
  userId?: number;
}

// Update Complaint DTO
export interface UpdateComplaintDto extends Partial<CreateComplaintDto> {
  id: number;
  statusId?: number;
}

// Attachment Interface
export interface Attachment extends BaseEntity {
  fileName: string;
  originalFileName: string;
  contentType: string;
  size: number;
  url: string;
  complaintId: number;
  complaint?: Complaint;
  complaintTitle?: string;
}

// Comment Interface
export interface Comment extends BaseEntity {
  content: string;
  complaintId: number;
  complaint?: Complaint;
  complaintTitle?: string;
  userId: number;
  user?: User;
  userFullName?: string;
  userNickName?: string;
  userPicture?: string;
}

// Create Comment DTO
export interface CreateCommentDto {
  content: string;
  complaintId: number;
  userId: number;
}

// Vote Interface
export interface Vote extends BaseEntity {
  voteType: VoteType;
  complaintId: number;
  complaint?: Complaint;
  complaintTitle?: string;
  userId: number;
  user?: User;
  userFullName?: string;
  userNickName?: string;
}

// Vote Type Enum
export enum VoteType {
  UP = 'up',
  DOWN = 'down'
}

// Create Vote DTO
export interface CreateVoteDto {
  voteType: VoteType;
  complaintId: number;
  userId: number;
}

// Role Interface
export interface Role extends BaseEntity {
  name: string;
  description?: string;
  usersCount?: number;
}

// User Profile Interface
export interface UserProfile extends BaseEntity {
  userId: number;
  user?: User;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  address?: string;
  profilePicture?: string;
}

// Notification Interface
export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  userId: number;
  user?: User;
  userFullName?: string;
  entityId?: number;
  entityType?: string;
  url?: string;
}

// Notification Type Enum
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

// Complaint History Interface
export interface ComplaintHistory extends BaseEntity {
  action: string;
  description?: string;
  oldValue?: string;
  newValue?: string;
  complaintId: number;
  complaint?: Complaint;
  complaintTitle?: string;
  userId: number;
  user?: User;
  userFullName?: string;
  statusId?: number;
  status?: Status;
  statusName?: string;
  statusColor?: string;
}

// Entity Union Types
export type Entity = 
  | Municipality 
  | Sector 
  | ComplaintType 
  | Status 
  | Complaint 
  | User 
  | Comment 
  | Vote 
  | Attachment 
  | Role 
  | UserProfile 
  | Notification 
  | ComplaintHistory;

export type CreateDto = 
  | CreateMunicipalityDto 
  | CreateSectorDto 
  | CreateComplaintTypeDto 
  | CreateStatusDto 
  | CreateComplaintDto 
  | CreateCommentDto 
  | CreateVoteDto;

export type UpdateDto = 
  | UpdateMunicipalityDto 
  | UpdateSectorDto 
  | UpdateComplaintTypeDto 
  | UpdateStatusDto 
  | UpdateComplaintDto;

// Entity Names Type
export type EntityName = 
  | 'municipality' 
  | 'sector' 
  | 'complaintType' 
  | 'status' 
  | 'complaint' 
  | 'user' 
  | 'comment' 
  | 'vote' 
  | 'attachment' 
  | 'role' 
  | 'userProfile' 
  | 'notification' 
  | 'complaintHistory';

// Type Guards
export const isMunicipality = (entity: Entity): entity is Municipality => {
  return 'code' in entity && 'sectorsCount' in entity;
};

export const isSector = (entity: Entity): entity is Sector => {
  return 'municipalityId' in entity && 'code' in entity;
};

export const isComplaint = (entity: Entity): entity is Complaint => {
  return 'title' in entity && 'description' in entity && 'priority' in entity;
};

export const isComplaintType = (entity: Entity): entity is ComplaintType => {
  return 'name' in entity && 'complaintsCount' in entity;
};

export const isStatus = (entity: Entity): entity is Status => {
  return 'color' in entity && 'name' in entity;
};