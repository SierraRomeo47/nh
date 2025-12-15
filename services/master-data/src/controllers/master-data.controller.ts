import { Request, Response } from 'express';
import masterDataService from '../services/master-data.service';

export const getVessels = async (req: Request, res: Response) => {
  try {
    const filters = {
      organizationId: req.query.organizationId as string,
      vesselType: req.query.vesselType as string,
      active: req.query.active === 'true',
    };

    const vessels = await masterDataService.getVessels(filters);

    res.status(200).json({
      success: true,
      data: vessels,
      count: vessels.length,
    });
  } catch (error: any) {
    console.error('Error fetching vessels:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch vessels',
    });
  }
};

export const getVesselById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vessel = await masterDataService.getVesselById(id);

    if (!vessel) {
      return res.status(404).json({
        success: false,
        error: 'Vessel not found',
      });
    }

    res.status(200).json({
      success: true,
      data: vessel,
    });
  } catch (error: any) {
    console.error('Error fetching vessel:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch vessel',
    });
  }
};

export const getVesselSelector = async (req: Request, res: Response) => {
  try {
    const organizationId = req.query.organizationId as string;
    const vessels = await masterDataService.getVesselSelector(organizationId);

    res.status(200).json({
      success: true,
      data: vessels,
    });
  } catch (error: any) {
    console.error('Error fetching vessel selector:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch vessel selector',
    });
  }
};

export const searchVessels = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required',
      });
    }

    const vessels = await masterDataService.searchVessels(q as string);

    res.status(200).json({
      success: true,
      data: vessels,
      count: vessels.length,
    });
  } catch (error: any) {
    console.error('Error searching vessels:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search vessels',
    });
  }
};

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const active = req.query.active !== 'false';
    const organizations = await masterDataService.getOrganizations(active);

    res.status(200).json({
      success: true,
      data: organizations,
      count: organizations.length,
    });
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch organizations',
    });
  }
};

export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organization = await masterDataService.getOrganizationById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
      });
    }

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error: any) {
    console.error('Error fetching organization:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch organization',
    });
  }
};

export const getOrganizationSelector = async (req: Request, res: Response) => {
  try {
    const organizations = await masterDataService.getOrganizationSelector();

    res.status(200).json({
      success: true,
      data: organizations,
    });
  } catch (error: any) {
    console.error('Error fetching organization selector:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch organization selector',
    });
  }
};

export const getUserSelector = async (req: Request, res: Response) => {
  try {
    const organizationId = req.query.organizationId as string;
    const users = await masterDataService.getUserSelector(organizationId);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Error fetching user selector:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch user selector',
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const filters = {
      organizationId: req.query.organizationId as string,
      role: req.query.role as string,
    };

    const users = await masterDataService.getUsers(filters);

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch users',
    });
  }
};

export const getPorts = async (req: Request, res: Response) => {
  try {
    const search = req.query.q as string;
    const ports = await masterDataService.getPorts(search);

    res.status(200).json({
      success: true,
      data: ports,
      count: ports.length,
    });
  } catch (error: any) {
    console.error('Error fetching ports:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch ports',
    });
  }
};

export const getFleetSummary = async (req: Request, res: Response) => {
  try {
    const organizationId = req.query.organizationId as string;
    const summary = await masterDataService.getFleetSummary(organizationId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Error fetching fleet summary:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch fleet summary',
    });
  }
};

export const getMasterDataSummary = async (req: Request, res: Response) => {
  try {
    const summary = await masterDataService.getMasterDataSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Error fetching master data summary:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch master data summary',
    });
  }
};

export const getHealthStatus = async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'master-data',
    timestamp: new Date().toISOString(),
  });
};

