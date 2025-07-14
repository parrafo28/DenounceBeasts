
using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure.Contracts;

namespace DenounceBeasts.Application.Services
{

    public class MunicipalityService : IMunicipalityService
    {

        private readonly IUnitOfWork _unitOfWork;

        public MunicipalityService(
            IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<int> CreateMunicipality(MunicipalityDto request)
        {
            var municipality = new Municipality
            {
                Code = request.Code,
                Name = request.Name,
                IsActive = true,
            };
            await _unitOfWork.Municipalities.AddAsync(municipality);
            await _unitOfWork.CompleteAsync();
            return municipality.Id;
        }
    }
}
