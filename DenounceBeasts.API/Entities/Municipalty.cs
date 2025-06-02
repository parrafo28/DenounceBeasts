
namespace DenounceBeasts.API.Entities
{
    //[Table("Minicipalties")] 
    public class Municipalty
    { 
        // int _Id;

        //public int Id
        //{
        //    get { return _Id; }
        //    set { _Id = value; }
        //}



        public int Id { get; set; } 
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Code { get; set; } 
        public string Name { get; set; } = string.Empty;

        //public virtual List<Sector> Sectors { get; set; }
        public virtual ICollection<Sector> Sectors { get; set; }

    }
}

