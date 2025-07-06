
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DenounceBeasts.Domain.Entities
{
    //attribute to map the class to a database table
    //[Table("MUNICIPALTY")] 
    public class Municipality
    {
        // int _Id;

        //public int Id
        //{
        //    get { return _Id; }
        //    set { _Id = value; }
        //}


        [Key]
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        [StringLength(50)]
        public string Code { get; set; } 
        //dataanotations for mapping the property to a column in the database
        // [Column("MunicipalityName")]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        public virtual List<Sector> Sectors { get; set; }
   
        //public string SetName(string name)
        //{
        //    if (string.IsNullOrWhiteSpace(name))
        //    {
        //        throw new ArgumentException("Municipality name cannot be empty.", nameof(name));
        //    }
        //    Name = name;
        //    return Name;
        //}

    }
}

